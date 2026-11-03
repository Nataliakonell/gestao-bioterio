using MediatR;

namespace Gestao_Bioterio.Application.Features.Species.Queries.GetAllSpecies
{
    public class GetAllEspeciesQuery : IRequest<PaginatedEspecieListVm>
    {
        public string? SearchTerm { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
