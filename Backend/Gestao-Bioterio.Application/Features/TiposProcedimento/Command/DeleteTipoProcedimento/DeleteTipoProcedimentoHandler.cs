using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.TiposProcedimento.Command.DeleteTipoProcedimento
{
    public class DeleteTipoProcedimentoHandler(ITipoProcedimentoRepository repository) : IRequestHandler<DeleteTipoProcedimentoCommand>
    {
        public async Task Handle(DeleteTipoProcedimentoCommand request, CancellationToken cancellationToken)
        {
            var entity = await repository.GetByIdAsync(request.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(TipoProcedimento), request.Id);
            }

            await repository.DeleteAsync(entity);
        }
    }
}
