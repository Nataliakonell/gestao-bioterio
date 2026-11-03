using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Groups.Queries.GetAllGroups
{

    public class GetAllGrupoQueryHandler(IMapper mapper, IGrupoRepository groupRepository)
        : IRequestHandler<GetAllGruposQuery, PaginatedGroupListVm>
    {
        public async Task<PaginatedGroupListVm> Handle(GetAllGruposQuery request, CancellationToken cancellationToken)
        {
            var count = await groupRepository.GetGrupoCountAsync(request.SearchTerm);
            var groups = await groupRepository.GetGrupoListAsync(request.SearchTerm, request.Page, request.PageSize);
            
            return new PaginatedGroupListVm
            {
                Items = mapper.Map<List<GruposListVm>>(groups.ToList()),
                TotalCount = count,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
    }
}
