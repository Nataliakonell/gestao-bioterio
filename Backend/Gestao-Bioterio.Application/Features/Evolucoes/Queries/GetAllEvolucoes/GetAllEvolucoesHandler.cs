using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Evolucoes.Queries.GetAllEvolucoes
{
    public class GetAllEvolucoesHandler(
        IMapper mapper,
        IEvolucaoRepository evolucaoRepository
    ) : IRequestHandler<GetAllEvolucoesQuery, List<EvolucaoListVm>>
    {
        public async Task<List<EvolucaoListVm>> Handle(GetAllEvolucoesQuery request, CancellationToken cancellationToken)
        {
            List<Evolucao> evolucoes;

            if (request.AnimalId.HasValue)
                evolucoes = await evolucaoRepository.GetEvolucoesByAnimalAsync(request.AnimalId.Value);
            else
                evolucoes = (await evolucaoRepository.ListAllAsync()).ToList();

            return mapper.Map<List<EvolucaoListVm>>(evolucoes);
        }
    }
}