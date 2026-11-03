using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.EventosAnimais.Command.DeleteEventoAnimal
{
    public class DeleteEventoAnimalHandler(IEventoAnimalRepository eventoAnimalRepository)
        : IRequestHandler<DeleteEventoAnimalCommand>
    {
        public async Task Handle(DeleteEventoAnimalCommand command, CancellationToken cancellationToken)
        {
            var entity = await eventoAnimalRepository.GetByIdAsync(command.Id);
            if (entity == null)
                return;

            await eventoAnimalRepository.DeleteAsync(entity);
        }
    }
}
