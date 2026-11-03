using MediatR;

namespace Gestao_Bioterio.Application.Features.BiometriaAnimais.Queries.GetAllBiometriaAnimal
{
    public class GetAllRotinaAnimalQuery : IRequest<PaginatedBiometriaAnimalListVm>
    {
        public int? AnimalId { get; set; }
        public string? SearchTerm { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public int? EspecieId { get; set; }
        public List<int>? FaseDeVida { get; set; }
    }
}
