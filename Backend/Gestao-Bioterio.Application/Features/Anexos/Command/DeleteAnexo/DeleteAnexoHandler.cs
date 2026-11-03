using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Anexos.Command.DeleteAnexo
{
    public class DeleteAnexoHandler(
        IAnexoRepository anexoRepository
    ) : IRequestHandler<DeleteAnexoCommand>
    {
        public async Task Handle(DeleteAnexoCommand request, CancellationToken cancellationToken)
        {
            var anexo = await anexoRepository.GetByIdAsync(request.Id);

            if (anexo == null)
                throw new NotFoundException(nameof(Anexo), request.Id);

            await anexoRepository.DeleteAsync(anexo);
        }
    }
}