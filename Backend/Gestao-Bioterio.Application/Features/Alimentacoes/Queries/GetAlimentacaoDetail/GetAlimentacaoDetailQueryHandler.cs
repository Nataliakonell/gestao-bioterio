using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAlimentacaoDetail
{
    public class GetAlimentacaoDetailQueryHandler(IMapper mapper, IAlimentacaoRepository alimentacaoRepository)
        : IRequestHandler<GetAlimentacaoDetailQuery, GetAlimentacaoDetailVm>
    {
        public async Task<GetAlimentacaoDetailVm> Handle(GetAlimentacaoDetailQuery request, CancellationToken cancellationToken)
        {
            var alimentacao = await alimentacaoRepository.GetAlimentacaoWithDetailsAsync(request.Id);

            if (alimentacao == null)
                throw new NotFoundException(nameof(Alimentacao), request.Id);

            return mapper.Map<GetAlimentacaoDetailVm>(alimentacao);
        }
    }
}
