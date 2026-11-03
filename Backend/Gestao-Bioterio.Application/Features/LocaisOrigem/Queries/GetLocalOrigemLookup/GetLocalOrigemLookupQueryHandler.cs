using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.LocaisOrigem.Queries.GetLocalOrigemLookup
{
    public class GetLocalOrigemLookupQueryHandler(ILocalOrigemRepository localOrigemRepository)
        : IRequestHandler<GetLocalOrigemLookupQuery, List<LocalOrigemLookupVm>>
    {
        public async Task<List<LocalOrigemLookupVm>> Handle(GetLocalOrigemLookupQuery request, CancellationToken cancellationToken)
        {
            var items = await localOrigemRepository.GetLocalOrigemLookupAsync();
            return items.Select(x => new LocalOrigemLookupVm { Id = x.Id, Nome = x.Nome }).ToList();
        }
    }
}
