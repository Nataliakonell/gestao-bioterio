using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.AltaAmbulatorial.Command.UpdateAltaAmbulatorial
{
    public class UpdateAltaAmbulatoriaHandler(
        IMapper mapper,
        IAltaAmbulatoriaRepository repository,
        IAnimalRepository animalRepository,
        IValidator<UpdateAltaAmbulatoriaCommand> validator)
        : IRequestHandler<UpdateAltaAmbulatoriaCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateAltaAmbulatoriaCommand command, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação da atualização do documento de alta.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var existing = await repository.GetByIdAsync(command.Id);
            if (existing == null)
                throw new NotFoundException(nameof(AltaAmbulatorial), command.Id);

            var retornoId = (command.InstalacaoBioterioRetornoId.HasValue && command.InstalacaoBioterioRetornoId.Value > 0)
                ? command.InstalacaoBioterioRetornoId
                : null;

            existing.AnimalId = command.AnimalId;
            existing.DataEntradaAmbulatorio = command.DataEntradaAmbulatorio;
            existing.DataAltaClinica = command.DataAltaClinica ?? existing.DataAltaClinica;
            existing.ProcedimentosMedicacoes = command.ProcedimentosMedicacoes;
            existing.ObservacoesClinicas = command.ObservacoesClinicas;
            existing.InstalacaoBioterioRetornoId = retornoId;

            await repository.UpdateAsync(existing);

            if (command.InstalacaoBioterioRetornoId.HasValue && command.InstalacaoBioterioRetornoId.Value > 0)
            {
                var animal = await animalRepository.GetByIdAsync(command.AnimalId);
                if (animal != null)
                {
                    animal.InstalacaoBioterioId = command.InstalacaoBioterioRetornoId.Value;
                    await animalRepository.UpdateAsync(animal);
                }
            }

            return new BaseResponse("Documento de alta ambulatorial atualizado com sucesso!");
        }
    }
}
