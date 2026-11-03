using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.CreateLiberacaoQuarentena
{
    public class CreateLiberacaoQuarentenaHandler(
        IMapper mapper,
        ILiberacaoQuarentenaRepository repository,
        IAnimalRepository animalRepository,
        IAnimalLocalizacaoRepository animalLocalizacaoRepository,
        IMovimentacaoAnimalRepository movimentacaoAnimalRepository,
        IValidator<CreateLiberacaoQuarentenaCommand> validator)
        : IRequestHandler<CreateLiberacaoQuarentenaCommand, CreateLiberacaoQuarentenaResponse>
    {
        public async Task<CreateLiberacaoQuarentenaResponse> Handle(CreateLiberacaoQuarentenaCommand command, CancellationToken cancellationToken)
        {
            var response = new CreateLiberacaoQuarentenaResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação da liberação de quarentena.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            if (command.InstalacaoBioterioId.HasValue && command.InstalacaoBioterioId.Value <= 0)
            {
                command.InstalacaoBioterioId = null;
            }

            var entity = mapper.Map<LiberacaoQuarentena>(command);
            if (entity.InstalacaoBioterioId.HasValue && entity.InstalacaoBioterioId.Value <= 0)
            {
                entity.InstalacaoBioterioId = null;
            }

            entity = await repository.AddAsync(entity);

            if (command.InstalacaoBioterioId.HasValue && command.InstalacaoBioterioId.Value > 0)
            {
                var animal = await animalRepository.GetByIdAsync(command.AnimalId);
                if (animal != null)
                {
                    animal.InstalacaoBioterioId = command.InstalacaoBioterioId.Value;
                    await animalRepository.UpdateAsync(animal);
                }
            }

            // Atualiza AnimalLocalizacao e registra MovimentacaoAnimal se destino informado
            var destinoLocId = command.LocalizacaoDestinoId ?? (command.InstalacaoBioterioId.HasValue ? command.InstalacaoBioterioId : null);
            if (destinoLocId.HasValue && destinoLocId.Value > 0)
            {
                var localizacaoAtual = await animalLocalizacaoRepository.ObterPorAnimalIdAsync(command.AnimalId);
                if (localizacaoAtual != null)
                {
                    localizacaoAtual.LocalizacaoId = destinoLocId.Value;
                    await animalLocalizacaoRepository.UpdateAsync(localizacaoAtual);
                }
                else
                {
                    await animalLocalizacaoRepository.AddAsync(new AnimalLocalizacao
                    {
                        AnimalId = command.AnimalId,
                        LocalizacaoId = destinoLocId.Value
                    });
                }

                await movimentacaoAnimalRepository.AddAsync(new MovimentacaoAnimal
                {
                    AnimalId = command.AnimalId,
                    LocalizacaoId = destinoLocId.Value,
                    TipoMovimentacao = TipoMovimentacao.Transferencia
                });
            }

            response.Id = entity.Id;
            response.LiberacaoQuarentena = mapper.Map<CreateLiberacaoQuarentenaDto>(entity);
            response.Message = "Liberação da quarentena registrada com sucesso!";
            return response;
        }
    }
}
