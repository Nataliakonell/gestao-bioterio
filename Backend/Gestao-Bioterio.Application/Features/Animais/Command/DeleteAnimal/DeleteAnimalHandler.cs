using Gestao_Bioterio.Application.Contracts.Infrastructure;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Animais.Command.DeleteAnimal
{
    public class DeleteAnimalHandler(
        IAnimalRepository animalRepository, 
        IBlobStorageService blobStorageService,
        IAlimentacaoRepository alimentacaoRepository,
        IBiometriaAnimalRepository biometriaAnimalRepository
    ) : IRequestHandler<DeleteAnimalCommand>
    {
        public async Task Handle(DeleteAnimalCommand command, CancellationToken cancellationToken)
        {
            var animal = await animalRepository.GetByIdAsync(command.Id);

            if (animal == null)
                throw new NotFoundException(nameof(Animal), command.Id);

            if (!string.IsNullOrWhiteSpace(animal.NomeArquivoFoto))
            {
                try
                {
                    await blobStorageService.DeleteFileAsync(animal.NomeArquivoFoto);
                }
                catch (System.Exception ex)
                {
                    System.Console.WriteLine($"Erro ao remover foto do blob: {ex.Message}");
                }
            }

            var alimentacoes = await alimentacaoRepository.GetAlimentacoesAsync(animal.Id);
            foreach (var alimentacao in alimentacoes)
            {
                await alimentacaoRepository.DeleteAsync(alimentacao);
                if (alimentacao.BiometriaAnimalId.HasValue && alimentacao.BiometriaAnimalId.Value > 0)
                {
                    var biometriaAlimentacao = await biometriaAnimalRepository.GetByIdAsync(alimentacao.BiometriaAnimalId.Value);
                    if (biometriaAlimentacao != null)
                        await biometriaAnimalRepository.DeleteAsync(biometriaAlimentacao);
                }
            }

            var biometrias = await biometriaAnimalRepository.GetBiometriaAsync(animal.Id);
            foreach (var biometria in biometrias)
            {
                await biometriaAnimalRepository.DeleteAsync(biometria);
            }

            await animalRepository.DeleteAsync(animal);
        }
    }
}
