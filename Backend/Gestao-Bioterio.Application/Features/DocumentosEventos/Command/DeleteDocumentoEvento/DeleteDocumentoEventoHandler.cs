using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.DocumentosEventos.Command.DeleteDocumentoEvento
{
    public class DeleteDocumentoEventoHandler(IDocumentoEventoRepository documentoEventoRepository)
        : IRequestHandler<DeleteDocumentoEventoCommand>
    {
        public async Task Handle(DeleteDocumentoEventoCommand command, CancellationToken cancellationToken)
        {
            var entity = await documentoEventoRepository.GetByIdAsync(command.Id);
            if (entity == null)
                return;

            await documentoEventoRepository.DeleteAsync(entity);
        }
    }
}
