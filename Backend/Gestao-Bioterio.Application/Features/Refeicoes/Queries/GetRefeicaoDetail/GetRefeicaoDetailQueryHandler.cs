using AutoMapper;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Refeicoes.Queries.GetRefeicaoDetail
{
    public class GetRefeicaoDetailQueryHandler (IMapper mapper, IRefeicaoRepository refeicaoRepository)
            : IRequestHandler<GetRefeicaoDetailQuery, GetRefeicaoDetailVm>
    {
        public async Task<GetRefeicaoDetailVm> Handle(GetRefeicaoDetailQuery request, CancellationToken cancellationToken)
        {
            var refeicao = await refeicaoRepository.GetRefeicaoWithDetailsAsync(request.Id);

            if (refeicao == null)
                throw new NotFoundException(nameof(Refeicao), request.Id);

            return mapper.Map<GetRefeicaoDetailVm>(refeicao);
        }
    }
}
