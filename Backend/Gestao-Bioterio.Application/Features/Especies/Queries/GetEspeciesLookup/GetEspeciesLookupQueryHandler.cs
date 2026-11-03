using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Especies.Queries.GetEspeciesLookup
{
    public class GetEspeciesLookupQueryHandler(IEspecieRepository especieRepository)
        : IRequestHandler<GetEspeciesLookupQuery, List<EspecieLookupVm>>
    {
        public async Task<List<EspecieLookupVm>> Handle(GetEspeciesLookupQuery request, CancellationToken cancellationToken)
        {
            var items = await especieRepository.GetEspeciesLookupAsync();
            return items.Select(x => new EspecieLookupVm
            {
                Id = x.Id,
                Nome = x.Nome,
                NomePopular = x.NomePopular
            }).ToList();
        }
    }
}
