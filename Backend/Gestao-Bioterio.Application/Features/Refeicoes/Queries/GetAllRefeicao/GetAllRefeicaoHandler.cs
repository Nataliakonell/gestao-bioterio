using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Refeicoes.Queries.GetAllRefeicao
{
    public class GetAllRefeicaoHandler(IMapper mapper, IRefeicaoRepository refeicaoRepository)
            : IRequestHandler<GetAllRefeicaoQuery, List<RefeicaoListVm>>
    {
        public async Task<List<RefeicaoListVm>> Handle(GetAllRefeicaoQuery request, CancellationToken cancellationToken)
        {

            var refeicoes = await refeicaoRepository.GetRefeicaoAsync(request.AlimentacaoId);

            return mapper.Map<List<RefeicaoListVm>>(refeicoes);
        }
    }
}
