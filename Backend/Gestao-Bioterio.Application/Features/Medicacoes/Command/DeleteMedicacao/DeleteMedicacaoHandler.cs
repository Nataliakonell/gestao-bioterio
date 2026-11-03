using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Medicacoes.Command.DeleteMedicacao
{
    public class DeleteMedicacaoHandler(
        IMedicacaoRepository medicacaoRepository)
        : IRequestHandler<DeleteMedicacaoCommand>
    {
        public async Task Handle(DeleteMedicacaoCommand request, CancellationToken cancellationToken)
        {
            var medicacao = await medicacaoRepository.GetByIdAsync(request.Id);

            if (medicacao == null)
                throw new NotFoundException(nameof(Medicacao), request.Id);

            await medicacaoRepository.DeleteAsync(medicacao);
        }
    }
}