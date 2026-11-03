using MediatR;

namespace Gestao_Bioterio.Application.Features.TiposProcedimento.Queries.GetTipoProcedimentoLookup
{
    public class TipoProcedimentoLookupVm
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
    }

    public class GetTipoProcedimentoLookupQuery : IRequest<List<TipoProcedimentoLookupVm>>
    {
    }
}
