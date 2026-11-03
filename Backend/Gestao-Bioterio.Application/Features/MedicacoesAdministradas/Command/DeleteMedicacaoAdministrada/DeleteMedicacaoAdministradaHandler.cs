using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Command.DeleteMedicacaoAdministrada
{
    public class DeleteMedicacaoAdministradaHandler(
        IMedicacaoAdministradaRepository medicacaoAdministradaRepository)
        : IRequestHandler<DeleteMedicacaoAdministradaCommand>
    {
        public async Task Handle(DeleteMedicacaoAdministradaCommand request, CancellationToken cancellationToken)
        {
            var administracao = await medicacaoAdministradaRepository.GetByIdAsync(request.Id);

            if (administracao == null)
                throw new NotFoundException(nameof(MedicacaoAdministrada), request.Id);

            await medicacaoAdministradaRepository.DeleteAsync(administracao);
        }
    }
}