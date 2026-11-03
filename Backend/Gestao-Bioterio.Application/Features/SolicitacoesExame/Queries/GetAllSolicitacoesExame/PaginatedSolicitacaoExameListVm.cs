namespace Gestao_Bioterio.Application.Features.SolicitacoesExame.Queries.GetAllSolicitacoesExame
{
    public class PaginatedSolicitacaoExameListVm
    {
        public List<SolicitacaoExameListVm> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
    }
}
