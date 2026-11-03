using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.Refeicoes.Queries.GetRefeicaoDetail;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Refeicoes.Command.UpdateRefeicao
{
    public class UpdateRefeicaoHandler(
        IMapper mapper,
        IRefeicaoRepository refeicaoRepository,
        IAlimentacaoRepository alimentacaoRepository,
        IValidator<UpdateRefeicaoCommand> validator
    ) : IRequestHandler<UpdateRefeicaoCommand, UpdateRefeicaoResponse>
    {
        public async Task<UpdateRefeicaoResponse> Handle(UpdateRefeicaoCommand command, CancellationToken cancellationToken)
        {
            var response = new UpdateRefeicaoResponse();

            var refeicao = await refeicaoRepository.GetRefeicaoWithDetailsAsync(command.Id);
            if (refeicao == null)
                throw new NotFoundException(nameof(Refeicao), command.Id);

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro na validação da atualização da refeição.";
                return response;
            }
            var oldAlimentacaoId = refeicao.AlimentacaoId;

            refeicao.AlimentacaoId = command.AlimentacaoId;
            
            refeicao.TipoRefeicao = command.TipoRefeicao;

            refeicao.PesoRefeicao = command.PesoRefeicao;
            refeicao.SituacaoRefeicao = command.SituacaoRefeicao;

            await refeicaoRepository.UpdateAsync(refeicao);

            var newAlimentacao = await alimentacaoRepository.GetAlimentacaoWithDetailsAsync(command.AlimentacaoId);
            if (newAlimentacao == null)
            {
                response.Success = false;
                response.Message = $"Alimentação com ID {command.AlimentacaoId} não encontrada.";
                return response;
            }

            newAlimentacao.RecalcularTotais();
            newAlimentacao.RecalcularStatus();
            await alimentacaoRepository.UpdateAsync(newAlimentacao);

            if (oldAlimentacaoId != command.AlimentacaoId)
            {
                var oldAlimentacao = await alimentacaoRepository.GetAlimentacaoWithDetailsAsync(oldAlimentacaoId);
                if (oldAlimentacao != null)
                {
                    oldAlimentacao.RecalcularTotais();
                    oldAlimentacao.RecalcularStatus();
                    await alimentacaoRepository.UpdateAsync(oldAlimentacao);
                }
            }

            var updatedRefeicao = await refeicaoRepository.GetRefeicaoWithDetailsAsync(refeicao.Id);

            response.Id = refeicao.Id;
            response.Refeicao = mapper.Map<GetRefeicaoDetailVm>(updatedRefeicao ?? refeicao);
            response.Message = "Refeição atualizada com sucesso!";

            return response;
        }
    }
}