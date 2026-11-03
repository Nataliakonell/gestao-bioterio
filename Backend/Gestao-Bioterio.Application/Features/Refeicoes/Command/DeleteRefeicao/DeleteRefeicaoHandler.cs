using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using static Gestao_Bioterio.Domain.Entities.Alimentacao;

namespace Gestao_Bioterio.Application.Features.Refeicoes.Command.DeleteRefeicao
{
    public class DeleteRefeicaoHandler(
        IRefeicaoRepository refeicaoRepository,
        IAlimentacaoRepository alimentacaoRepository
    ) : IRequestHandler<DeleteRefeicaoCommand>
    {
        public async Task Handle(DeleteRefeicaoCommand c, CancellationToken cancellationToken)
        {
            var refeicao = await refeicaoRepository.GetByIdAsync(c.Id);

            if (refeicao == null)
                return;

            var alimentacaoId = refeicao.AlimentacaoId;

            await refeicaoRepository.DeleteAsync(refeicao);

            var alimentacao = await alimentacaoRepository.GetAlimentacaoWithDetailsAsync(alimentacaoId);
            if (alimentacao != null)
            {
                alimentacao.RecalcularTotais();
                alimentacao.RecalcularStatus();
                await alimentacaoRepository.UpdateAsync(alimentacao);
            }
        }
    }
}
