using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.BiometriaAnimais.Command.CreateBiometriaAnimais
{
    public class CreateBiometriaAnimalHandler(
        IMapper mapper,
        IBiometriaAnimalRepository biometriaAnimalRepository,
        IAnimalRepository animalRepository,
        IValidator<CreateBiometriaAnimalCommand> validator
    ) : IRequestHandler<CreateBiometriaAnimalCommand, CreateBiometriaAnimalResponse>
    {
        public async Task<CreateBiometriaAnimalResponse> Handle(CreateBiometriaAnimalCommand command, CancellationToken cancellationToken)
        {
            var response = new CreateBiometriaAnimalResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);

            if (!validationResult.IsValid)
            {
                response.Success = false;
                response.Message = "Erro na validação da Biometria Animal.";
                response.ValidationErrors = validationResult.Errors
                    .Select(error => error.ErrorMessage)
                    .ToList();

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

            decimal? comprimentoAnterior = null;
            decimal? comprimentoCaudaAnterior = null;

            var biometrias = await biometriaAnimalRepository.GetBiometriaAsync(command.AnimalId);
            var biometriaAnterior = biometrias.OrderByDescending(b => b.Id).FirstOrDefault();
            
            if (biometriaAnterior != null)
            {
                comprimentoAnterior = biometriaAnterior.Comprimento;
                comprimentoCaudaAnterior = biometriaAnterior.ComprimentoCauda;
            }

            var biometriaAnimal = mapper.Map<BiometriaAnimal>(command);

            if (biometriaAnimal.DataBiometria == default)
            {
                biometriaAnimal.DataBiometria = DateTime.UtcNow;
            }
            
            if (!biometriaAnimal.Comprimento.HasValue || biometriaAnimal.Comprimento <= 0)
            {
                biometriaAnimal.Comprimento = comprimentoAnterior;
            }
            if (!biometriaAnimal.ComprimentoCauda.HasValue || biometriaAnimal.ComprimentoCauda <= 0)
            {
                biometriaAnimal.ComprimentoCauda = comprimentoCaudaAnterior;
            }

            biometriaAnimal = await biometriaAnimalRepository.AddAsync(biometriaAnimal);

            response.Success = true;
            response.Id = biometriaAnimal.Id;
            response.BiometriaAnimal = mapper.Map<CreateBiometriaAnimalDto>(biometriaAnimal); 
            response.Message = "Biometria adicionada com sucesso!";

            return response;
        }

    }
}
