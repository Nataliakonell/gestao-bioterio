using Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAnimalRotinaStatus;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAllAnimaisRotinaStatus
{
    public class PaginatedAnimalRotinaStatusVm
    {
        public List<AnimalRotinaStatusVm> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public RotinaStatusSummaryVm Summary { get; set; } = new();
    }
}
