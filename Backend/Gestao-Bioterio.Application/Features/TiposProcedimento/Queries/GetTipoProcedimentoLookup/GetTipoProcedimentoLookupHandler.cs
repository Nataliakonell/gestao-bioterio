using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.TiposProcedimento.Queries.GetTipoProcedimentoLookup
{
    public class GetTipoProcedimentoLookupHandler(ITipoProcedimentoRepository repository, IMapper mapper) 
        : IRequestHandler<GetTipoProcedimentoLookupQuery, List<TipoProcedimentoLookupVm>>
    {
        public async Task<List<TipoProcedimentoLookupVm>> Handle(GetTipoProcedimentoLookupQuery request, CancellationToken cancellationToken)
        {
            var entities = await repository.ListAllAsync();
            var activeEntities = entities.Where(e => e.Ativo).OrderBy(e => e.Nome).ToList();
            return mapper.Map<List<TipoProcedimentoLookupVm>>(activeEntities);
        }
    }
}
