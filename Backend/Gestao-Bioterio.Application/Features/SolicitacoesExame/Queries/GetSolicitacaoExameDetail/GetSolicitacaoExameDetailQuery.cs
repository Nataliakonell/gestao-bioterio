using MediatR;

namespace Gestao_Bioterio.Application.Features.SolicitacoesExame.Queries.GetSolicitacaoExameDetail
{
    public class GetSolicitacaoExameDetailQuery : IRequest<SolicitacaoExameDetailVm>
    {
        public int Id { get; set; }
    }
}