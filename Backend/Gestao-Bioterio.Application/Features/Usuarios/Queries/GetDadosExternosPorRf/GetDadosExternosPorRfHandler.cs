using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Contracts.Persistence.DTOs;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Usuarios.Queries.GetDadosExternosPorRf
{
    public class GetDadosExternosPorRfHandler(IUsuarioRepository usuarioRepository) 
        : IRequestHandler<GetDadosExternosPorRfQuery, UsuarioExternoDto?>
    {
        public async Task<UsuarioExternoDto?> Handle(GetDadosExternosPorRfQuery request, CancellationToken cancellationToken)
        {
            return await usuarioRepository.BuscarDadosExternosPorRfAsync(request.Rf);
        }
    }
}
