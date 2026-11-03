using MediatR;

namespace Gestao_Bioterio.Application.Features.SolicitacoesExame.Queries.GetAllSolicitacoesExame
{
    public class GetAllSolicitacoesExameQuery : IRequest<List<SolicitacaoExameListVm>>
    {
        public int? AnimalId { get; set; }
    }
}