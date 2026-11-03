using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.SuspendPrescricaoMedicacao
{
    public class SuspendPrescricaoMedicacaoHandler(
        IPrescricaoMedicacaoRepository prescricaoMedicacaoRepository,
        IValidator<SuspendPrescricaoMedicacaoCommand> validator
    ) : IRequestHandler<SuspendPrescricaoMedicacaoCommand, SuspendPrescricaoMedicacaoResponse>
    {
        public async Task<SuspendPrescricaoMedicacaoResponse> Handle(SuspendPrescricaoMedicacaoCommand request, CancellationToken cancellationToken)
        {
            var response = new SuspendPrescricaoMedicacaoResponse();

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação da suspensão da prescrição.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var prescricao = await prescricaoMedicacaoRepository.GetPrescricaoWithDetailsAsync(request.Id);
            if (prescricao == null)
                throw new NotFoundException(nameof(PrescricaoMedicacao), request.Id);

            if (prescricao.StatusPrescricao == StatusPrescricao.Suspensa)
            {
                response.Success = false;
                response.Message = "Prescrição já está suspensa.";
                return response;
            }

            if (prescricao.StatusPrescricao == StatusPrescricao.Concluida)
            {
                response.Success = false;
                response.Message = "Prescrição já concluída não pode ser suspensa.";
                return response;
            }

            var possuiDosePendente = prescricao.Administracoes.Any(a =>
                a.StatusDose == StatusDose.Agendada || a.StatusDose == StatusDose.Atrasada);
            if (prescricao.Administracoes.Count > 0 && !possuiDosePendente)
            {
                response.Success = false;
                response.Message = "Não é possível suspender: todas as doses já foram concluídas.";
                return response;
            }

            prescricao.StatusPrescricao = StatusPrescricao.Suspensa;
            prescricao.DataHoraSuspensao = DateTime.Now;
            prescricao.MotivoSuspensao = request.MotivoSuspensao.Trim();

            await prescricaoMedicacaoRepository.UpdateAsync(prescricao);

            response.Id = prescricao.Id;
            response.Message = "Prescrição suspensa com sucesso.";
            return response;
        }
    }
}
