using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Procedimentos.Command.DeleteProcedimento
{
    public class DeleteProcedimentoHandler(
        IProcedimentoRepository procedimentoRepository
    ) : IRequestHandler<DeleteProcedimentoCommand>
    {
        public async Task Handle(DeleteProcedimentoCommand request, CancellationToken cancellationToken)
        {
            var procedimento = await procedimentoRepository.GetByIdAsync(request.Id);

            if (procedimento == null)
                throw new NotFoundException(nameof(Procedimento), request.Id);

            await procedimentoRepository.DeleteAsync(procedimento);
        }
    }
}