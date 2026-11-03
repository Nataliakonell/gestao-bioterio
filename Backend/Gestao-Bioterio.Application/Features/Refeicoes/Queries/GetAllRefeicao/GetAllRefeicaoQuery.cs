using MediatR;

namespace Gestao_Bioterio.Application.Features.Refeicoes.Queries.GetAllRefeicao
{
    public class GetAllRefeicaoQuery : IRequest<List<RefeicaoListVm>>
    {
        public int? AlimentacaoId { get; set; }
    }
}
