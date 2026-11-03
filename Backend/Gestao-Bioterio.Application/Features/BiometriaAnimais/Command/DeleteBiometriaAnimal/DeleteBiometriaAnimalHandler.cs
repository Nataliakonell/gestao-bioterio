using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.BiometriaAnimais.Command.DeleteBiometriaAnimal
{
    public class DeleteBiometriaAnimalHandler(IBiometriaAnimalRepository biometriaAnimalRepository) : IRequestHandler<DeleteBiometriaAnimalCommand>
    {
        public async Task Handle(DeleteBiometriaAnimalCommand command, CancellationToken cancellationToken)
        {
            var biometriaAnimal = await biometriaAnimalRepository.GetByIdAsync(command.Id);

            if (biometriaAnimal == null)
                throw new NotFoundException(nameof(BiometriaAnimal), command.Id);


            await biometriaAnimalRepository.DeleteAsync(biometriaAnimal);
        }
    }
}
