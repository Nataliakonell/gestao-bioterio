using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.SolicitacoesExame.Command.UpdateSolicitacaoExame
{
    public class UpdateSolicitacaoExameHandler(
        ISolicitacaoExameRepository solicitacaoExameRepository,
        IValidator<UpdateSolicitacaoExameCommand> validator
    ) : IRequestHandler<UpdateSolicitacaoExameCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateSolicitacaoExameCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse("Erro na validação da atualização da solicitação de exame.", false);

            var solicitacao = await solicitacaoExameRepository.GetByIdAsync(request.Id);
            if (solicitacao == null)
                throw new NotFoundException(nameof(SolicitacaoExame), request.Id);

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            solicitacao.AnimalId = request.AnimalId;
            solicitacao.TipoExame = request.TipoExame;
            solicitacao.SinaisClinicos = request.SinaisClinicos;
            solicitacao.SuspeitaClinica = request.SuspeitaClinica;
            solicitacao.RegiaoAnatomica = request.RegiaoAnatomica;
            solicitacao.Observacao = request.Observacao ?? string.Empty;
            solicitacao.Responsavel = request.Responsavel;

            await solicitacaoExameRepository.UpdateAsync(solicitacao);

            response.Success = true;
            response.Message = "Solicitação de exame atualizada com sucesso!";
            return response;
        }
    }
}