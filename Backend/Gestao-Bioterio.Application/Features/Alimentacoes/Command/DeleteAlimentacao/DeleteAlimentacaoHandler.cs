using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Alimentacoes.Command.DeleteAlimentacao
{
    public class DeleteAlimentacaoHandler(IAlimentacaoRepository alimentacaoRepository)
        : IRequestHandler<DeleteAlimentacaoCommand>
    {
        public async Task Handle(DeleteAlimentacaoCommand command, CancellationToken cancellationToken)
        {
            var alimentacao = await alimentacaoRepository.GetAlimentacaoWithDetailsAsync(command.Id);

            if (alimentacao == null)
                throw new NotFoundException(nameof(Domain.Entities.Alimentacao), command.Id);

            await alimentacaoRepository.DeleteAsync(alimentacao);
        }
    }
}
