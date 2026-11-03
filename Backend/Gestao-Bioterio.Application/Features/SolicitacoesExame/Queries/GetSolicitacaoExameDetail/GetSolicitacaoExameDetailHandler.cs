using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.SolicitacoesExame.Queries.GetSolicitacaoExameDetail
{
    public class GetSolicitacaoExameDetailHandler(
        IMapper mapper,
        ISolicitacaoExameRepository solicitacaoExameRepository)
        : IRequestHandler<GetSolicitacaoExameDetailQuery, SolicitacaoExameDetailVm>
    {
        public async Task<SolicitacaoExameDetailVm> Handle(GetSolicitacaoExameDetailQuery request, CancellationToken cancellationToken)
        {
            var solicitacao = await solicitacaoExameRepository.GetSolicitacaoWithDetailsAsync(request.Id);

            if (solicitacao == null)
                throw new NotFoundException(nameof(SolicitacaoExame), request.Id);

            return mapper.Map<SolicitacaoExameDetailVm>(solicitacao);
        }
    }
}