using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Command.CreateMovimentacaoAnimal
{
    public class CreateMovimentacaoAnimalHandler(
        IMapper mapper,
        IMovimentacaoAnimalRepository movimentacaoAnimalRepository,
        IAnimalLocalizacaoRepository animalLocalizacaoRepository,
        IValidator<CreateMovimentacaoAnimalCommand> validator
    ) : IRequestHandler<CreateMovimentacaoAnimalCommand, CreateMovimentacaoAnimalResponse>
    {
        public async Task<CreateMovimentacaoAnimalResponse> Handle(CreateMovimentacaoAnimalCommand command, CancellationToken cancellationToken)
        {
            var response = new CreateMovimentacaoAnimalResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (!validationResult.IsValid)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro na validação do registro de movimentação.";
                return response;
            }

            var entity = mapper.Map<MovimentacaoAnimal>(command);
            entity = await movimentacaoAnimalRepository.AddAsync(entity);

            // Atualiza ou cria a localização atual do animal (AnimalLocalizacao)
            var localizacaoAtual = await animalLocalizacaoRepository.ObterPorAnimalIdAsync(command.AnimalId);
            if (localizacaoAtual != null)
            {
                localizacaoAtual.LocalizacaoId = command.LocalizacaoId;
                await animalLocalizacaoRepository.UpdateAsync(localizacaoAtual);
            }
            else
            {
                await animalLocalizacaoRepository.AddAsync(new AnimalLocalizacao
                {
                    AnimalId = command.AnimalId,
                    LocalizacaoId = command.LocalizacaoId
                });
            }

            response.Success = true;
            response.Id = entity.Id;
            response.MovimentacaoAnimal = mapper.Map<CreateMovimentacaoAnimalDto>(entity);
            response.Message = "Movimentação registrada com sucesso!";

            return response;
        }
    }
}
