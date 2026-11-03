using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;

namespace Gestao_Bioterio.Api.Middleware
{
    public class UcdbAuthenticationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly HttpClient _httpClient;
        private readonly UcdbAuthenticationOptions _options;
        private readonly ILogger<UcdbAuthenticationMiddleware> _logger;
        private readonly IMemoryCache _tokenCache;
        private readonly IWebHostEnvironment _environment;

        public UcdbAuthenticationMiddleware(
            RequestDelegate next,
            IHttpClientFactory httpFactory,
            IOptions<UcdbAuthenticationOptions> options,
            ILogger<UcdbAuthenticationMiddleware> logger,
            IMemoryCache memoryCache,
            IWebHostEnvironment environment)
        {
            _next = next;
            _httpClient = httpFactory.CreateClient("UcdbAuth");
            _httpClient.BaseAddress = new Uri(options.Value.Authority);
            _httpClient.Timeout = TimeSpan.FromSeconds(2);
            _options = options.Value;
            _logger = logger;
            _tokenCache = memoryCache;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (_environment.IsDevelopment() &&
                context.Request.Path.StartsWithSegments("/api") &&
                context.Request.Headers.TryGetValue("X-Swagger-Request", out var swaggerRequest) &&
                string.Equals(swaggerRequest.ToString(), "true", StringComparison.OrdinalIgnoreCase))
            {
                context.User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim("RF", "swagger-dev"),
                    new Claim(ClaimTypes.Name, "Usuário Swagger (desenvolvimento)")
                ], "SwaggerDevelopment"));

                await _next(context);
                return;
            }

            var token = ExtractToken(context);

            if (!string.IsNullOrEmpty(token))
            {
                var isActive = ValidateTokenWithCache(token);
                if (!isActive)
                {
                    _logger.LogWarning("Token inválido ou expirado para {Path}", context.Request.Path);
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsJsonAsync(new { error = "Token inválido" });
                    return;
                }

                context.User = CreateClaimsPrincipal(token);
            }
            else if (RequiresAuthentication(context))
            {
                _logger.LogWarning("Acesso negado a rota protegida sem token: {Path}", context.Request.Path);
                context.Response.StatusCode = 401;
                await context.Response.WriteAsJsonAsync(new { error = "unauthorized" });
                return;
            }

            await _next(context);
        }

        private static bool RequiresAuthentication(HttpContext context)
        {
            var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";

            if (!path.StartsWith("/api/"))
                return false;

            // Rotas públicas dentro de /api
            if (path.StartsWith("/api/auth"))
                return false;

            return true;
        }

        private string? ExtractToken(HttpContext context)
        {
            if (context.Request.Headers.ContainsKey("Authorization"))
            {
                var authHeader = context.Request.Headers["Authorization"].ToString();
                if (authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                    return authHeader.Substring(7);
            }
            if (context.Request.Cookies.TryGetValue("bioterio_token", out var cookieToken))
                return cookieToken;
            // 3. Query string ?token=xxx
            if (context.Request.Query.TryGetValue("token", out var queryToken))
                return queryToken;

            return null;
        }

        private bool ValidateTokenWithCache(string token)
        {
            var cacheKey = $"token_validation_{token.GetHashCode()}";
            if (_tokenCache.TryGetValue(cacheKey, out bool cachedResult))
                return cachedResult;

            var isValid = ValidateToken(token);
            _tokenCache.Set(cacheKey, isValid, _options.TokenCacheExpiry);
            return isValid;
        }

        private bool ValidateToken(string token)
        {
            // TODO (Segurança): Desativar os tokens estáticos ("test-token", "gestao-bioterio-admin", "gestao-bioterio-user") em ambiente de Produção.
            // Recomendado: Envolver com um "if (_env.IsDevelopment())" ou utilizar diretivas "#if DEBUG".
            if (token == "test-token" || token == "gestao-bioterio-admin" || token == "gestao-bioterio-user" || token.StartsWith("mock-token-")) return true;

            try
            {
                var handler = new JwtSecurityTokenHandler();
                if (!handler.CanReadToken(token))
                    return false;

                var jwt = handler.ReadJwtToken(token);
                if (jwt.ValidTo != DateTime.MinValue && jwt.ValidTo < DateTime.UtcNow)
                {
                    _logger.LogWarning("Token JWT expirado em {ValidTo}", jwt.ValidTo);
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Erro ao validar token JWT");
                return false;
            }
        }

        private ClaimsPrincipal CreateClaimsPrincipal(string token)
        {
            var claims = new List<Claim>();

            if (token == "gestao-bioterio-admin" || token == "test-token")
            {
                claims.Add(new Claim("RF", "admin"));
                claims.Add(new Claim("Role", "Admin"));
                claims.Add(new Claim(ClaimTypes.Name, "Administrador"));
                return new ClaimsPrincipal(new ClaimsIdentity(claims, "UcdbOAuth2"));
            }
            if (token == "gestao-bioterio-user")
            {
                claims.Add(new Claim("RF", "user"));
                claims.Add(new Claim(ClaimTypes.Name, "Usuário de Teste"));
                return new ClaimsPrincipal(new ClaimsIdentity(claims, "UcdbOAuth2"));
            }
            if (token.StartsWith("mock-token-"))
            {
                claims.Add(new Claim("RF", token.Substring(11)));
                claims.Add(new Claim(ClaimTypes.Name, "Usuário Mock"));
                return new ClaimsPrincipal(new ClaimsIdentity(claims, "UcdbOAuth2"));
            }

            string? rfValue = null;

            try
            {
                var handler = new JwtSecurityTokenHandler();
                if (handler.CanReadToken(token))
                {
                    var jwt = handler.ReadJwtToken(token);
                    foreach (var claim in jwt.Claims)
                    {
                        claims.Add(claim);

                        if (claim.Type == "realm_access" && claim.Value.Contains("roles"))
                        {
                            try 
                            {
                                using var doc = JsonDocument.Parse(claim.Value);
                                if (doc.RootElement.TryGetProperty("roles", out var rolesElement))
                                {
                                    foreach (var role in rolesElement.EnumerateArray())
                                    {
                                        var roleStr = role.GetString();
                                        if ((roleStr == "Admin" || roleStr == "gestao-bioterio-admin") && !claims.Any(c => c.Type == "Role" && c.Value == "Admin"))
                                        {
                                            claims.Add(new Claim("Role", "Admin"));
                                        }
                                    }
                                }
                            } 
                            catch { }
                        }
                        // Mapear se vier diretamente em uma claim "role" (minúsculo) ou ClaimTypes.Role
                        else if ((claim.Type == "role" || claim.Type == ClaimTypes.Role) && (claim.Value == "Admin" || claim.Value == "gestao-bioterio-admin"))
                        {
                            if (!claims.Any(c => c.Type == "Role" && c.Value == "Admin"))
                            {
                                claims.Add(new Claim("Role", "Admin"));
                            }
                        }
                    }

                    rfValue = jwt.Claims
                        .FirstOrDefault(c => string.Equals(c.Type, "RF", StringComparison.OrdinalIgnoreCase)
                                          || string.Equals(c.Type, "rf", StringComparison.OrdinalIgnoreCase)
                                          || string.Equals(c.Type, "preferred_username", StringComparison.OrdinalIgnoreCase))
                        ?.Value;

                    var nameValue = jwt.Claims
                        .FirstOrDefault(c => c.Type == "name" || c.Type == ClaimTypes.Name)?.Value;
                    if (!string.IsNullOrEmpty(nameValue) && !claims.Any(c => c.Type == ClaimTypes.Name))
                        claims.Add(new Claim(ClaimTypes.Name, nameValue));
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Erro ao extrair claims do JWT");
            }

            if (!string.IsNullOrEmpty(rfValue) && !claims.Any(c => c.Type == "RF"))
                claims.Add(new Claim("RF", rfValue));

            return new ClaimsPrincipal(new ClaimsIdentity(claims, "UcdbOAuth2"));
        }
    }
}

