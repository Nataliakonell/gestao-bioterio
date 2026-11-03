using MediatR;

namespace Gestao_Bioterio.Application.Features.Groups.Queries.GetAllGroups
{
    public class GetAllGruposQuery : IRequest<PaginatedGroupListVm>
    {
        public string? SearchTerm { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
