using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.SolicitacoesExame.Command.CreateSolicitacaoExame
{
    public class CreateSolicitacaoExameHandler(
        IMapper mapper,
        ISolicitacaoExameRepository solicitacaoExameRepository,
        IValidator<CreateSolicitacaoExameCommand> validator
    ) : IRequestHandler<CreateSolicitacaoExameCommand, CreateSolicitacaoExameResponse>
    {
        public async Task<CreateSolicitacaoExameResponse> Handle(CreateSolicitacaoExameCommand request, CancellationToken cancellationToken)
        {
            var response = new CreateSolicitacaoExameResponse();

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação da solicitação de exame.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }
            var solicitacao = new SolicitacaoExame
            {
                AnimalId = request.AnimalId,
                TipoExame = request.TipoExame,
                SinaisClinicos = request.SinaisClinicos,
                SuspeitaClinica = request.SuspeitaClinica,
                RegiaoAnatomica = request.RegiaoAnatomica,
                Observacao = request.Observacao ?? string.Empty,
                Responsavel = request.Responsavel
            };

            solicitacao = await solicitacaoExameRepository.AddAsync(solicitacao);

            response.Id = solicitacao.Id;
            response.SolicitacaoExame = mapper.Map<CreateSolicitacaoExameDto>(solicitacao);
            response.Message = "Solicitação de exame cadastrada com sucesso!";
            return response;
        }
    }
}