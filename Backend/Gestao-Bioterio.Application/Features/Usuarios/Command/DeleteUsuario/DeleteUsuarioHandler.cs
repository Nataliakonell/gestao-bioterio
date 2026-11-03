using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Usuarios.Command.DeleteUsuario
{
    public class DeleteUsuarioHandler(IUsuarioRepository repository) : IRequestHandler<DeleteUsuarioCommand>
    {
        public async Task Handle(DeleteUsuarioCommand request, CancellationToken cancellationToken)
        {
            var entity = await repository.GetByIdAsync(request.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(Usuario), request.Id);
            }

            await repository.DeleteAsync(entity);
        }
    }
}
