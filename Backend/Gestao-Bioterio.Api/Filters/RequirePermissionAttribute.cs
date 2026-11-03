using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Gestao_Bioterio.Api.Filters
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class RequirePermissionAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly string _funcionalidade;
        private readonly NivelAcesso? _nivelMinimo;

        public RequirePermissionAttribute(string funcionalidade)
        {
            _funcionalidade = funcionalidade;
        }

        public RequirePermissionAttribute(string funcionalidade, NivelAcesso nivelMinimo)
        {
            _funcionalidade = funcionalidade;
            _nivelMinimo = nivelMinimo;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var environment = context.HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();
            if (environment.IsDevelopment() &&
                context.HttpContext.Request.Path.StartsWithSegments("/api") &&
                context.HttpContext.Request.Headers.TryGetValue("X-Swagger-Request", out var swaggerRequest) &&
                string.Equals(swaggerRequest.ToString(), "true", StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            var user = context.HttpContext.User;

            if (user?.Identity == null || !user.Identity.IsAuthenticated)
            {
                context.Result = new StatusCodeResult(Microsoft.AspNetCore.Http.StatusCodes.Status401Unauthorized);
                return;
            }

            var rfClaim = user.Claims.FirstOrDefault(c => c.Type == "RF" || c.Type == "rf" || c.Type == "preferred_username");
            var rf = rfClaim?.Value;

            var usuarioRepository = context.HttpContext.RequestServices.GetRequiredService<IUsuarioRepository>();
            var perfilPermissaoRepository = context.HttpContext.RequestServices.GetRequiredService<IPerfilPermissaoRepository>();

            Usuario? usuario = null;
            if (!string.IsNullOrEmpty(rf))
            {
                usuario = await usuarioRepository.GetByRfAsync(rf);
            }

            // Se o usuário existir no banco e estiver inativo (Status == false), nenhum acesso é permitido a nenhuma funcionalidade
            if (usuario != null && !usuario.Status)
            {
                context.Result = new StatusCodeResult(Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden);
                return;
            }

            if (user.HasClaim(c => c.Type == "Role" && c.Value == "Admin"))
            {
                return; 
            }

            if (string.IsNullOrEmpty(rf) || usuario == null)
            {
                context.Result = new StatusCodeResult(Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden);
                return;
            }

            var temPermissao = await perfilPermissaoRepository.HasPermissionAsync(usuario.PerfilId, _funcionalidade, _nivelMinimo);

            if (!temPermissao)
            {
                context.Result = new StatusCodeResult(Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden);
            }
        }
    }
}
