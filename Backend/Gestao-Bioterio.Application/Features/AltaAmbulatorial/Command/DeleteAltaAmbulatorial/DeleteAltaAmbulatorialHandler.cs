using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using MediatR;

namespace Gestao_Bioterio.Application.Features.AltaAmbulatorial.Command.DeleteAltaAmbulatorial
{
    public class DeleteAltaAmbulatorialHandler(IAltaAmbulatoriaRepository repository)
        : IRequestHandler<DeleteAltaAmbulatorialCommand>
    {
        public async Task Handle(DeleteAltaAmbulatorialCommand request, CancellationToken cancellationToken)
        {
            var entity = await repository.GetByIdAsync(request.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(Gestao_Bioterio.Domain.Entities.AltaAmbulatorial), request.Id);
            }

            await repository.DeleteAsync(entity);
        }
    }
}
