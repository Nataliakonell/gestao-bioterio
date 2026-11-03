using MediatR;

namespace Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Queries.GetLiberacaoQuarentena
{
    public class GetLiberacaoQuarentenaQuery : IRequest<LiberacaoQuarentenaDetailVm?>
    {
        public int? Id { get; set; }
        public int? AnimalId { get; set; }
    }
}
