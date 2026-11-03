using MediatR;

namespace Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Queries.GetAllLiberacoesQuarentena
{
    public class GetAllLiberacoesQuarentenaQuery : IRequest<List<LiberacaoQuarentenaListVm>>
    {
        public int? AnimalId { get; set; }
    }
}
