using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using System.Linq;

namespace Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Command.UpdateMedicacaoAdministrada
{
    public class UpdateMedicacaoAdministradaHandler(
        IMedicacaoAdministradaRepository medicacaoAdministradaRepository,
        IPrescricaoMedicacaoRepository prescricaoMedicacaoRepository,
        IAnimalRepository animalRepository,
        IValidator<UpdateMedicacaoAdministradaCommand> validator
    ) : IRequestHandler<UpdateMedicacaoAdministradaCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateMedicacaoAdministradaCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação da atualização de administração de medicação.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var administracao = await medicacaoAdministradaRepository.GetByIdAsync(request.Id);
            if (administracao == null)
                throw new NotFoundException(nameof(MedicacaoAdministrada), request.Id);

            var prescricaoCheck = await prescricaoMedicacaoRepository.GetByIdAsync(request.PrescricaoMedicacaoId);
            if (prescricaoCheck != null)
            {
                if (prescricaoCheck.StatusPrescricao == StatusPrescricao.Suspensa)
                {
                    response.Success = false;
                    response.Message = "Não é possível administrar esta medicação porque a prescrição está suspensa.";
                    return response;
                }

                var isVivo = await animalRepository.IsAnimalVivoAsync(prescricaoCheck.AnimalId, cancellationToken);
                if (!isVivo)
                {
                    response.Success = false;
                    response.Message = "Não é possível administrar esta medicação porque o animal associado encontra-se com situação 'Óbito' ou 'Reintroduzido'.";
                    response.ValidationErrors = new List<string> { response.Message };
                    return response;
                }
            }

            bool isConcluido = request.StatusDose == StatusDose.Concluido;
            bool statusChangedToConcluido = isConcluido && administracao.StatusDose != StatusDose.Concluido;

            administracao.PrescricaoMedicacaoId = request.PrescricaoMedicacaoId;
            administracao.DataHoraAdministracao = request.DataHoraAdministracao;
            administracao.DataHoraPrevista = request.DataHoraPrevista;
            administracao.Observacao = request.Observacao ?? string.Empty;
            administracao.Responsavel = request.Responsavel;
            administracao.StatusDose = request.StatusDose;

            await medicacaoAdministradaRepository.UpdateAsync(administracao);
            if (isConcluido || request.DataHoraAdministracao == null)
            {
                var prescricao = await prescricaoMedicacaoRepository.GetByIdAsync(request.PrescricaoMedicacaoId);
                if (prescricao != null && prescricao.IntervaloEntreDosesHoras > 0)
                {
                    var administracoes = await medicacaoAdministradaRepository.GetAdministracoesByPrescricaoAsync(prescricao.Id);

                    var futuras = administracoes
                        .Where(a => a.StatusDose != StatusDose.Concluido && a.Id != administracao.Id)
                        .OrderBy(a => a.Id)
                        .ToList();

                    DateTime baseTime;

                    if (isConcluido && request.DataHoraAdministracao.HasValue)
                    {
                        var lastAdministered = administracoes
                            .Where(a => a.StatusDose == StatusDose.Concluido)
                            .OrderByDescending(a => a.DataHoraAdministracao)
                            .FirstOrDefault();

                        baseTime = lastAdministered?.DataHoraAdministracao ?? request.DataHoraAdministracao.Value;
                    }
                    else
                    {
                        var lastAdministered = administracoes
                            .Where(a => a.StatusDose == StatusDose.Concluido && a.Id != administracao.Id)
                            .OrderByDescending(a => a.DataHoraAdministracao)
                            .FirstOrDefault();

                        baseTime = lastAdministered?.DataHoraAdministracao ?? prescricao.DataHoraInicio;
                    }

                    for (int i = 0; i < futuras.Count; i++)
                    {
                        futuras[i].DataHoraPrevista = baseTime.AddHours((i + 1) * prescricao.IntervaloEntreDosesHoras);
                        await medicacaoAdministradaRepository.UpdateAsync(futuras[i]);
                    }
                }
            }

            response.Message = "Administração de medicação atualizada com sucesso!";
            return response;
        }
    }
}
