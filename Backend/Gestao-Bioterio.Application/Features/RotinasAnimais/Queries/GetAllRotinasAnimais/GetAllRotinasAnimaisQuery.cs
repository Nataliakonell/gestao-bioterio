using MediatR;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAllRotinasAnimais
{
    public class GetAllRotinasAnimaisQuery : IRequest<PaginatedRotinaAnimalListVm>
    {
        public string? SearchTerm { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public int? EspecieId { get; set; }
        public List<int>? FaseDeVidas { get; set; }
    }
}
