using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Grupos.Queries.GetGrupoLookup
{
    public class GetGrupoLookupQueryHandler(IGrupoRepository grupoRepository)
        : IRequestHandler<GetGrupoLookupQuery, List<GrupoLookupVm>>
    {
        public async Task<List<GrupoLookupVm>> Handle(GetGrupoLookupQuery request, CancellationToken cancellationToken)
        {
            var items = await grupoRepository.GetGrupoLookupAsync();
            return items.Select(x => new GrupoLookupVm { Id = x.Id, Nome = x.Nome }).ToList();
        }
    }
}
