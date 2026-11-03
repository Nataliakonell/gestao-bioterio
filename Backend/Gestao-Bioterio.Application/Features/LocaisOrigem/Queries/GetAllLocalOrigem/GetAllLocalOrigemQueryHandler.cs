using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.LocaisOrigem.Queries.GetAllLocalOrigem
{
    public class GetAllLocalOrigemQueryHandler(IMapper mapper, ILocalOrigemRepository localOrigemRepository) 
        : IRequestHandler<GetAllLocalOrigemQuery, PaginatedLocalOrigemListVm>
    {
        public async Task<PaginatedLocalOrigemListVm> Handle(GetAllLocalOrigemQuery request, CancellationToken cancellationToken)
        {
            var count = await localOrigemRepository.GetLocalOrigemCountAsync(request.SearchTerm);
            var allLocalOrigem = await localOrigemRepository.GetLocalOrigemListAsync(request.SearchTerm, request.Page, request.PageSize);
            
            return new PaginatedLocalOrigemListVm
            {
                Items = mapper.Map<List<LocalOrigemListVm>>(allLocalOrigem),
                TotalCount = count,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
    }
}
