using MediatR;

namespace Gestao_Bioterio.Application.Features.TiposProcedimento.Queries.GetAllTiposProcedimento
{
    public class GetAllTiposProcedimentoQuery : IRequest<List<TipoProcedimentoListVm>>
    {
    }
}
