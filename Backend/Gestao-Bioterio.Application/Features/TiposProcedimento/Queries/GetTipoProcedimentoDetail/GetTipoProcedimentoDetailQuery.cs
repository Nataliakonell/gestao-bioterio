using MediatR;

namespace Gestao_Bioterio.Application.Features.TiposProcedimento.Queries.GetTipoProcedimentoDetail
{
    public class TipoProcedimentoDetailVm
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }

    public class GetTipoProcedimentoDetailQuery : IRequest<TipoProcedimentoDetailVm>
    {
        public int Id { get; set; }
    }
}
