using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.AltaAmbulatorial.Command.CreateAltaAmbulatorial
{
    public class CreateAltaAmbulatoriaHandler(
        IMapper mapper,
        IAltaAmbulatoriaRepository repository,
        IAnimalRepository animalRepository,
        IAnimalLocalizacaoRepository animalLocalizacaoRepository,
        IMovimentacaoAnimalRepository movimentacaoAnimalRepository,
        IValidator<CreateAltaAmbulatoriaCommand> validator)
        : IRequestHandler<CreateAltaAmbulatoriaCommand, CreateAltaAmbulatoriaResponse>
    {
        public async Task<CreateAltaAmbulatoriaResponse> Handle(CreateAltaAmbulatoriaCommand command, CancellationToken cancellationToken)
        {
            var response = new CreateAltaAmbulatoriaResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação do documento de alta ambulatorial.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            if (command.InstalacaoBioterioRetornoId.HasValue && command.InstalacaoBioterioRetornoId.Value <= 0)
            {
                command.InstalacaoBioterioRetornoId = null;
            }

            var entity = mapper.Map<Gestao_Bioterio.Domain.Entities.AltaAmbulatorial>(command);
            if (entity.InstalacaoBioterioRetornoId.HasValue && entity.InstalacaoBioterioRetornoId.Value <= 0)
            {
                entity.InstalacaoBioterioRetornoId = null;
            }

            entity = await repository.AddAsync(entity);

            if (command.InstalacaoBioterioRetornoId.HasValue && command.InstalacaoBioterioRetornoId.Value > 0)
            {
                var animal = await animalRepository.GetByIdAsync(command.AnimalId);
                if (animal != null)
                {
                    animal.InstalacaoBioterioId = command.InstalacaoBioterioRetornoId.Value;
                    await animalRepository.UpdateAsync(animal);
                }
            }

            // Atualiza AnimalLocalizacao e registra MovimentacaoAnimal se destino informado
            var destinoLocId = command.LocalizacaoDestinoId ?? (command.InstalacaoBioterioRetornoId.HasValue ? command.InstalacaoBioterioRetornoId : null);
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
            response.AltaAmbulatorial = mapper.Map<CreateAltaAmbulatoriaDto>(entity);
            response.Message = "Documento de alta ambulatorial registrado com sucesso!";
            return response;
        }
    }
}
