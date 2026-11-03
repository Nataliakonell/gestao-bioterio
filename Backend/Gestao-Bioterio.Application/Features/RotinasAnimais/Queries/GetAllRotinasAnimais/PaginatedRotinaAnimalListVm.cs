namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAllRotinasAnimais
{
    public class PaginatedRotinaAnimalListVm
    {
        public List<RotinaAnimalListVm> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }
}
