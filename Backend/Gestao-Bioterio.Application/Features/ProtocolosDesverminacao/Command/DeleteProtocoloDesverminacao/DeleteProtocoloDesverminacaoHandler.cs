using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Command.DeleteProtocoloDesverminacao
{
    public class DeleteProtocoloDesverminacaoHandler(
        IProtocoloDesverminacaoRepository protocoloRepository)
        : IRequestHandler<DeleteProtocoloDesverminacaoCommand>
    {
        public async Task Handle(DeleteProtocoloDesverminacaoCommand request, CancellationToken cancellationToken)
        {
            var protocolo = await protocoloRepository.GetByIdAsync(request.Id);

            if (protocolo == null)
                throw new NotFoundException(nameof(ProtocoloDesverminacao), request.Id);

            await protocoloRepository.DeleteAsync(protocolo);
        }
    }
}