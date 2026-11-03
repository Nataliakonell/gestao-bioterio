using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Usuarios.Queries.GetMyPermissoes
{
    public class GetMyPermissoesHandler(IUsuarioRepository usuarioRepository, IPerfilPermissaoRepository perfilPermissaoRepository) 
        : IRequestHandler<GetMyPermissoesQuery, MyPermissoesVm>
    {
        public async Task<MyPermissoesVm> Handle(GetMyPermissoesQuery request, CancellationToken cancellationToken)
        {
            var response = new MyPermissoesVm
            {
                IsAdmin = request.IsAdmin,
                Permissoes = new List<FuncionalidadePermissaoDto>()
            };

            if (string.IsNullOrEmpty(request.RF))
            {
                return response;
            }

            var usuario = await usuarioRepository.GetByRfAsync(request.RF);
            if (usuario == null)
            {
                return response;
            }

            response.Status = usuario.Status;

            // Se o usuário estiver inativo (Status == false), não possui permissão a nenhuma funcionalidade nem status de Admin no sistema
            if (!usuario.Status)
            {
                response.IsAdmin = false;
                response.Permissoes = new List<FuncionalidadePermissaoDto>();
                return response;
            }

            if (request.IsAdmin)
            {
                return response;
            }

            var permissoes = await perfilPermissaoRepository.GetPermissoesByPerfilIdAsync(usuario.PerfilId);

            response.Permissoes = permissoes.Select(p => new FuncionalidadePermissaoDto
            {
                Funcionalidade = p.Funcionalidade,
                NivelAcesso = p.NivelAcesso
            }).ToList();

            return response;
        }
    }
}
