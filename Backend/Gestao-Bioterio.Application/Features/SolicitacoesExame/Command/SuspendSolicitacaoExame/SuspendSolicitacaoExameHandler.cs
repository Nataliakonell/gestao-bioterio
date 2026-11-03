using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.SolicitacoesExame.Command.SuspendSolicitacaoExame
{
    public class SuspendSolicitacaoExameHandler(
        ISolicitacaoExameRepository solicitacaoExameRepository,
        IValidator<SuspendSolicitacaoExameCommand> validator
    ) : IRequestHandler<SuspendSolicitacaoExameCommand, SuspendSolicitacaoExameResponse>
    {
        public async Task<SuspendSolicitacaoExameResponse> Handle(SuspendSolicitacaoExameCommand request, CancellationToken cancellationToken)
        {
            var response = new SuspendSolicitacaoExameResponse();

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação da suspensão da solicitação de exame.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var solicitacao = await solicitacaoExameRepository.GetByIdAsync(request.Id);
            if (solicitacao == null)
                throw new NotFoundException(nameof(SolicitacaoExame), request.Id);

            if (solicitacao.Status == StatusSolicitacaoExame.Cancelada)
            {
                response.Success = false;
                response.Message = "Solicitação já cancelada e não pode ser suspensa.";
                return response;
            }

            if (solicitacao.Status == StatusSolicitacaoExame.Suspensa)
            {
                response.Success = false;
                response.Message = "Solicitação já suspensa.";
                return response;
            }

            solicitacao.Status = StatusSolicitacaoExame.Suspensa;
            solicitacao.DataSuspensao = DateTime.Now;
            solicitacao.MotivoSuspensao = request.MotivoSuspensao.Trim();

            await solicitacaoExameRepository.UpdateAsync(solicitacao);

            response.Id = solicitacao.Id;
            response.Message = "Solicitação de exame suspensa com sucesso.";
            return response;
        }
    }
}
