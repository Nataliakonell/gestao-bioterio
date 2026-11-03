using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Command.DeleteDoseAplicacaoDesverminacao
{
    public class DeleteDoseAplicacaoDesverminacaoHandler(
        IDoseAplicacaoDesverminacaoRepository doseRepository)
        : IRequestHandler<DeleteDoseAplicacaoDesverminacaoCommand>
    {
        public async Task Handle(DeleteDoseAplicacaoDesverminacaoCommand request, CancellationToken cancellationToken)
        {
            var dose = await doseRepository.GetByIdAsync(request.Id);

            if (dose == null)
                throw new NotFoundException(nameof(DoseAplicacaoDesverminacao), request.Id);

            await doseRepository.DeleteAsync(dose);
        }
    }
}