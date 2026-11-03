using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Features.BiometriaAnimais.Queries.GetBiometriaAnimalDetail;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.BiometriaAnimais.Command.UpdateBiometriaAnimal
{
    public class UpdateBiometriaAnimalHandler(
        IMapper mapper,
        IBiometriaAnimalRepository biometriaAnimalRepository,
        IAnimalRepository animalRepository,
        IValidator<UpdateBiometriaAnimalCommand> validator
    ) : IRequestHandler<UpdateBiometriaAnimalCommand, UpdateBiometriaAnimalResponse>
    {
        public async Task<UpdateBiometriaAnimalResponse> Handle(UpdateBiometriaAnimalCommand command, CancellationToken cancellationToken)
        {
            var response = new UpdateBiometriaAnimalResponse();

            var biometria = await biometriaAnimalRepository.GetBiometriaWithDetailsAsync(command.Id);
            if (biometria == null)
                throw new NotFoundException(nameof(BiometriaAnimal), command.Id);

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro na validação da atualização da biometria animal.";
                return response;
            }

            var animal = await animalRepository.GetByIdAsync(command.AnimalId);
            if (animal == null)
            {
                response.Success = false;
                response.Message = $"Animal com ID {command.AnimalId} não encontrado.";
                return response;
            }

            if (animal.SituacaoAnimal != Situacao.Vivo)
            {
                response.Success = false;
                response.Message = $"Não é permitido registrar biometria para animal com situação '{animal.SituacaoAnimal}'.";
                response.ValidationErrors = new List<string> { response.Message };
                return response;
            }

            biometria.AnimalId = command.AnimalId;
            biometria.Peso = command.Peso;
            biometria.Comprimento = command.Comprimento;
            biometria.ComprimentoCauda = command.ComprimentoCauda;
            biometria.DataBiometria = command.DataBiometria;

            await biometriaAnimalRepository.UpdateAsync(biometria);

            var updatedBiometria = await biometriaAnimalRepository.GetBiometriaWithDetailsAsync(biometria.Id);

            response.Id = biometria.Id;
            response.BiometriaAnimal = mapper.Map<GetBiometriaAnimalDetailVm>(updatedBiometria ?? biometria);
            response.Message = "Biometria animal atualizada com sucesso!";

            return response;
        }
    }
}
