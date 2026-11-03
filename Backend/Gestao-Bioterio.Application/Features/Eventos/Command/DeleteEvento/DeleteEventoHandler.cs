using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Eventos.Command.DeleteEvento
{
    public class DeleteEventoHandler(IEventoRepository eventoRepository)
        : IRequestHandler<DeleteEventoCommand>
    {
        public async Task Handle(DeleteEventoCommand command, CancellationToken cancellationToken)
        {
            var entity = await eventoRepository.GetByIdAsync(command.Id);
            if (entity == null)
                return;

            await eventoRepository.DeleteAsync(entity);
        }
    }
}
