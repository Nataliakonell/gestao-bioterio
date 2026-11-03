using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.SolicitacoesExame.Command.DeleteSolicitacaoExame
{
    public class DeleteSolicitacaoExameHandler(
        ISolicitacaoExameRepository solicitacaoExameRepository)
        : IRequestHandler<DeleteSolicitacaoExameCommand>
    {
        public async Task Handle(DeleteSolicitacaoExameCommand request, CancellationToken cancellationToken)
        {
            var solicitacao = await solicitacaoExameRepository.GetByIdAsync(request.Id);

            if (solicitacao == null)
                throw new NotFoundException(nameof(SolicitacaoExame), request.Id);

            await solicitacaoExameRepository.DeleteAsync(solicitacao);
        }
    }
}