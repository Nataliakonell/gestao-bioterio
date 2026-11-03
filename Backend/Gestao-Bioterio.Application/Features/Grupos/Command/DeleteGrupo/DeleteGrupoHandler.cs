using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Groups.Command.DeleteGroup
{
    public class DeleteGrupoHandler(IGrupoRepository groupRepository) : IRequestHandler<DeleteGrupoCommand>
    {
        public async Task Handle(DeleteGrupoCommand c, CancellationToken cancellationToken)
        {
            var group = await groupRepository.GetByIdAsync(c.Id);

            if (group == null)
                return;
            await groupRepository.DeleteAsync(group);
        }
    }
}