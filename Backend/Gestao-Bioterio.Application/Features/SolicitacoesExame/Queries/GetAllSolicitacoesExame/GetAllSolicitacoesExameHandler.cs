using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.SolicitacoesExame.Queries.GetAllSolicitacoesExame
{
    public class GetAllSolicitacoesExameHandler(
        IMapper mapper,
        ISolicitacaoExameRepository solicitacaoExameRepository)
        : IRequestHandler<GetAllSolicitacoesExameQuery, List<SolicitacaoExameListVm>>
    {
        public async Task<List<SolicitacaoExameListVm>> Handle(GetAllSolicitacoesExameQuery request, CancellationToken cancellationToken)
        {
            if (request.AnimalId.HasValue)
            {
                var porAnimal = await solicitacaoExameRepository.GetSolicitacoesByAnimalAsync(request.AnimalId.Value);
                return mapper.Map<List<SolicitacaoExameListVm>>(porAnimal);
            }

            var todas = await solicitacaoExameRepository.ListAllAsync();
            return mapper.Map<List<SolicitacaoExameListVm>>(todas);
        }
    }
}