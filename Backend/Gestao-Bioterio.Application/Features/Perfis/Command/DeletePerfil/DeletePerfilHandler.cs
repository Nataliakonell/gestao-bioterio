using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Perfis.Command.DeletePerfil
{
    public class DeletePerfilHandler(IPerfilRepository perfilRepository) : IRequestHandler<DeletePerfilCommand>
    {
        public async Task Handle(DeletePerfilCommand cmd, CancellationToken ct)
        {
            var perfilToDelete = await perfilRepository.GetByIdAsync(cmd.Id);
            if (perfilToDelete == null)
            {
                throw new NotFoundException(nameof(Perfil), cmd.Id);
            }

            await perfilRepository.DeleteAsync(perfilToDelete);
        }
    }
}
