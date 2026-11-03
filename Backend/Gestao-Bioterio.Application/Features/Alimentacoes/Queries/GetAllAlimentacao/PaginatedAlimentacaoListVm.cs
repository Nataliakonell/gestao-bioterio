using Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAllAlimentacoes;

namespace Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAllAlimentacao
{
    public class PaginatedAlimentacaoListVm
    {
        public List<AlimentacaoListVm> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }
}
