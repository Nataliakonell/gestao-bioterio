namespace Gestao_Bioterio.Application.Features.Groups.Queries.GetAllGroups
{
    public class PaginatedGroupListVm
    {
        public List<GruposListVm> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }
}
