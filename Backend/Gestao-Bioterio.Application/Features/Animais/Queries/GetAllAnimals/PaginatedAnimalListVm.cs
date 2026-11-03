namespace Gestao_Bioterio.Application.Features.Animais.Queries.GetAllAnimals
{
    public class PaginatedAnimalListVm
    {
        public List<AnimalListVm> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }
}
