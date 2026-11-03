using MediatR;

namespace Gestao_Bioterio.Application.Features.LocaisOrigem.Queries.GetAllLocalOrigem
{
    public class GetAllLocalOrigemQuery : IRequest<PaginatedLocalOrigemListVm>
    {
        public string? SearchTerm { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
