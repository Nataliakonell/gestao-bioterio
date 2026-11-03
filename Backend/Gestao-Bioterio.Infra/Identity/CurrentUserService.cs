using Gestao_Bioterio.Application.Contracts.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.IdentityModel.Tokens.Jwt;

namespace Gestao_Bioterio.Infra.Identity
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<CurrentUserService> _logger;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor, ILogger<CurrentUserService> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

        public string? GetRfFromToken()
        {
            var rfFromClaims = _httpContextAccessor.HttpContext?.User?.Claims
                ?.FirstOrDefault(c => string.Equals(c.Type, "RF", StringComparison.OrdinalIgnoreCase))?.Value;

            if (!string.IsNullOrEmpty(rfFromClaims))
            {
                _logger.LogDebug("RF obtido das claims: {RF}", rfFromClaims);
                return rfFromClaims;
            }

            var jwt = ReadJwtFromRequest();
            if (jwt == null) return null;

            var rf = jwt.Claims
                .FirstOrDefault(c => string.Equals(c.Type, "RF", StringComparison.OrdinalIgnoreCase)
                                  || string.Equals(c.Type, "rf", StringComparison.OrdinalIgnoreCase)
                                  || string.Equals(c.Type, "preferred_username", StringComparison.OrdinalIgnoreCase))
                ?.Value;

            _logger.LogDebug("RF extraído do payload JWT: {RF}", rf ?? "(não encontrado)");
            return rf;
        }

        public string? GetNomeFromToken()
        {
            var jwt = ReadJwtFromRequest();
            if (jwt == null) return null;

            // Tenta extrair o nome completo das claims mais comuns do Keycloak/OIDC
            var givenName = jwt.Claims.FirstOrDefault(c => string.Equals(c.Type, "given_name", StringComparison.OrdinalIgnoreCase))?.Value;
            var familyName = jwt.Claims.FirstOrDefault(c => string.Equals(c.Type, "family_name", StringComparison.OrdinalIgnoreCase))?.Value;
            var fullNameFromGiven = (!string.IsNullOrEmpty(givenName) && !string.IsNullOrEmpty(familyName))
                ? $"{givenName} {familyName}"
                : null;

            var nome = jwt.Claims.FirstOrDefault(c =>
                    string.Equals(c.Type, "name", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(c.Type, "nome", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(c.Type, "nome_completo", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(c.Type, "nomeCompleto", StringComparison.OrdinalIgnoreCase))
                ?.Value;

            var result = nome ?? fullNameFromGiven;

            if (string.IsNullOrEmpty(result))
            {
                // Fallback: tenta preferred_username apenas se não for um número puro (matrícula numérica)
                var preferred = jwt.Claims.FirstOrDefault(c =>
                    string.Equals(c.Type, "preferred_username", StringComparison.OrdinalIgnoreCase))?.Value;
                if (!string.IsNullOrEmpty(preferred))
                    result = preferred;
            }

            _logger.LogDebug("Nome extraído do payload JWT: {Nome}", result ?? "(não encontrado)");
            return result;
        }

        private JwtSecurityToken? ReadJwtFromRequest()
        {
            var authHeader = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                _httpContextAccessor.HttpContext?.Request.Cookies.TryGetValue("bioterio_token", out authHeader);
                if (string.IsNullOrEmpty(authHeader))
                {
                    _logger.LogWarning("Nenhum token encontrado no header ou cookie");
                    return null;
                }
            }
            else
            {
                authHeader = authHeader.Substring(7);
            }

            try
            {
                var handler = new JwtSecurityTokenHandler();
                if (!handler.CanReadToken(authHeader))
                {
                    _logger.LogWarning("Token não é um JWT válido");
                    return null;
                }

                var jwt = handler.ReadJwtToken(authHeader);
                _logger.LogDebug("Claims do JWT: {Claims}",
                    string.Join(", ", jwt.Claims.Select(c => $"{c.Type}={c.Value}")));
                return jwt;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao decodificar o JWT");
                return null;
            }
        }
    }
}

