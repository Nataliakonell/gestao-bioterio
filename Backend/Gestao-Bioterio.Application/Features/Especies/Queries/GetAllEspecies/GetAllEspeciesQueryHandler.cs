using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Species.Queries.GetAllSpecies
{
    public class GetAllEspeciesQueryHandler(IMapper mapper, IEspecieRepository specieRepository)
        : IRequestHandler<GetAllEspeciesQuery, PaginatedEspecieListVm>
    {
        public async Task<PaginatedEspecieListVm> Handle(GetAllEspeciesQuery request, CancellationToken cancellationToken)
        {
            var count = await specieRepository.GetEspeciesCountAsync(request.SearchTerm);
            var species = await specieRepository.GetEspeciesListAsync(request.SearchTerm, request.Page, request.PageSize);
            
            return new PaginatedEspecieListVm
            {
                Items = mapper.Map<List<EspecieListVm>>(species.ToList()),
                TotalCount = count,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
    }
}
