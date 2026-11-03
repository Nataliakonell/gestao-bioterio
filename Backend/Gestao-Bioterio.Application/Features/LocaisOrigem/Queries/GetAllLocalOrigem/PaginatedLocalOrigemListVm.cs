namespace Gestao_Bioterio.Application.Features.LocaisOrigem.Queries.GetAllLocalOrigem
{
    public class PaginatedLocalOrigemListVm
    {
        public List<LocalOrigemListVm> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }
}
