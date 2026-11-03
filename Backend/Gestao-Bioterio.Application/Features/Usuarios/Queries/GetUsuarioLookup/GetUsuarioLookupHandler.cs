using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Usuarios.Queries.GetUsuarioLookup
{
    public class GetUsuarioLookupHandler(IUsuarioRepository usuarioRepository) : IRequestHandler<GetUsuarioLookupQuery, List<UsuarioLookupVm>>
    {
        public async Task<List<UsuarioLookupVm>> Handle(GetUsuarioLookupQuery request, CancellationToken cancellationToken)
        {
            var usuarios = await usuarioRepository.GetUsuarioLookupAsync();

            return usuarios.Select(u => new UsuarioLookupVm
            {
                Id = u.Id,
                Nome = u.Nome,
                RF = u.RF
            }).ToList();
        }
    }
}
