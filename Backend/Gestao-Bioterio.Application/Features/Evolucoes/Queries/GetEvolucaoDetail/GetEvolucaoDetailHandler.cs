using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Evolucoes.Queries.GetEvolucaoDetail
{
    public class GetEvolucaoDetailHandler(
        IMapper mapper,
        IEvolucaoRepository evolucaoRepository
    ) : IRequestHandler<GetEvolucaoDetailQuery, EvolucaoDetailVm>
    {
        public async Task<EvolucaoDetailVm> Handle(
            GetEvolucaoDetailQuery request,
            CancellationToken cancellationToken)
        {
            var evolucao = await evolucaoRepository.GetEvolucaoWithDetailsAsync(request.Id);

            if (evolucao == null)
                throw new NotFoundException(nameof(Evolucao), request.Id);

            return mapper.Map<EvolucaoDetailVm>(evolucao);
        }
    }
}