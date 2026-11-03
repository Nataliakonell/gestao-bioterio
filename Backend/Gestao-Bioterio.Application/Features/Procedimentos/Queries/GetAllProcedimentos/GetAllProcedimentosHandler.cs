using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Procedimentos.Queries.GetAllProcedimentos
{
    public class GetAllProcedimentosHandler(
        IMapper mapper,
        IProcedimentoRepository procedimentoRepository
    ) : IRequestHandler<GetAllProcedimentosQuery, List<ProcedimentoListVm>>
    {
        public async Task<List<ProcedimentoListVm>> Handle(GetAllProcedimentosQuery request, CancellationToken cancellationToken)
        {
            List<Procedimento> procedimentos;

            if (request.AnimalId.HasValue)
                procedimentos = await procedimentoRepository.GetProcedimentosByAnimalAsync(request.AnimalId.Value);
            else
                procedimentos = await procedimentoRepository.GetAllWithTipoAsync();

            return mapper.Map<List<ProcedimentoListVm>>(procedimentos);
        }
    }
}