using Gestao_Bioterio.Application.Contracts.Persistence.DTOs;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Usuarios.Queries.GetDadosExternosPorRf
{
    public class GetDadosExternosPorRfQuery : IRequest<UsuarioExternoDto?>
    {
        public string Rf { get; set; } = string.Empty;
    }
}
