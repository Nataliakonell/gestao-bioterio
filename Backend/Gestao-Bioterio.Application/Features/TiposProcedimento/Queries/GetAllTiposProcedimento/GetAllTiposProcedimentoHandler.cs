using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.TiposProcedimento.Queries.GetAllTiposProcedimento
{
    public class GetAllTiposProcedimentoHandler(ITipoProcedimentoRepository repository, IMapper mapper) 
        : IRequestHandler<GetAllTiposProcedimentoQuery, List<TipoProcedimentoListVm>>
    {
        public async Task<List<TipoProcedimentoListVm>> Handle(GetAllTiposProcedimentoQuery request, CancellationToken cancellationToken)
        {
            var tipos = await repository.ListAllAsync();
            return mapper.Map<List<TipoProcedimentoListVm>>(tipos.OrderBy(x => x.Nome));
        }
    }
}
