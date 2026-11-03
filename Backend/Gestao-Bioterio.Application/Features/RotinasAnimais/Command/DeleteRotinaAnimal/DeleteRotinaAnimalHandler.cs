using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Command.DeleteRotinaAnimal
{
    public class DeleteRotinaAnimalHandler
        (IRotinaAnimalRepository rotinaAnimalRepository)
        : IRequestHandler<DeleteRotinaAnimalCommand>
    {
        public async Task Handle(DeleteRotinaAnimalCommand request, CancellationToken cancellationToken)
        {
            var rotina = await rotinaAnimalRepository.GetByIdAsync(request.Id);

            if (rotina == null)
                throw new NotFoundException(nameof(RotinaAnimal), request.Id);

            await rotinaAnimalRepository.DeleteAsync(rotina);
        }
    }
}