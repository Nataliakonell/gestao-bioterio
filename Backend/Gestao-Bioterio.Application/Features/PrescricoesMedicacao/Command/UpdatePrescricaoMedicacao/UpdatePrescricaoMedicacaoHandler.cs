using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using System.Linq;

namespace Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.UpdatePrescricaoMedicacao
{
    public class UpdatePrescricaoMedicacaoHandler(
        IPrescricaoMedicacaoRepository prescricaoMedicacaoRepository,
        IMedicacaoAdministradaRepository medicacaoAdministradaRepository,
        IValidator<UpdatePrescricaoMedicacaoCommand> validator
    ) : IRequestHandler<UpdatePrescricaoMedicacaoCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdatePrescricaoMedicacaoCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação da atualização de prescrição de medicação.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var prescricao = await prescricaoMedicacaoRepository.GetByIdAsync(request.Id);
            if (prescricao == null)
                throw new NotFoundException(nameof(PrescricaoMedicacao), request.Id);

            if (prescricao.StatusPrescricao == StatusPrescricao.Suspensa)
            {
                response.Success = false;
                response.Message = "Não é possível editar uma prescrição suspensa.";
                return response;
            }

            if (prescricao.StatusPrescricao == StatusPrescricao.Concluida)
            {
                response.Success = false;
                response.Message = "Não é possível editar uma prescrição concluída.";
                return response;
            }

            var administracoes = await medicacaoAdministradaRepository.GetAdministracoesByPrescricaoAsync(request.Id);
            if (administracoes.Count > 0 && administracoes.All(a => a.StatusDose == StatusDose.Concluido))
            {
                response.Success = false;
                response.Message = "Não é possível editar uma prescrição cujas doses já foram todas concluídas.";
                return response;
            }

            prescricao.AnimalId = request.AnimalId;
            prescricao.MedicacaoId = request.MedicacaoId;
            prescricao.VolumeDose = request.VolumeDose;
            prescricao.ViaAdministracao = request.ViaAdministracao;
            prescricao.QuantidadeDoses = request.QuantidadeDoses;
            prescricao.IntervaloEntreDosesHoras = request.IntervaloEntreDosesHoras;
            prescricao.DataHoraInicio = request.DataHoraInicio;
            prescricao.Observacao = request.Observacao ?? string.Empty;
            prescricao.Responsavel = request.Responsavel ?? string.Empty;

            await prescricaoMedicacaoRepository.UpdateAsync(prescricao);

            response.Message = "Prescrição de medicação atualizada com sucesso!";
            return response;
        }
    }
}
