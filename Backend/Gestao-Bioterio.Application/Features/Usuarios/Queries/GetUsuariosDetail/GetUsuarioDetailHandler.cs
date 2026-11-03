using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Usuarios.Queries.GetUsuariosDetail
{
    public class GetUsuarioDetailHandler (IMapper mapper, IUsuarioRepository usuarioRepository) : IRequestHandler<GetUsuarioDetailQuery, UsuarioDetailVm>
    {
        public async Task<UsuarioDetailVm> Handle(GetUsuarioDetailQuery request, CancellationToken cancellationToken)
        {
            var usuario = await usuarioRepository.GetByIdAsync(request.Id);

            if(usuario == null)
                throw new NotFoundException(nameof(Usuario), request.Id);

            return mapper.Map<UsuarioDetailVm>(usuario);
        }
    }
}
