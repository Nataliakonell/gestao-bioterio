using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.DeletePrescricaoMedicacao
{
    public class DeletePrescricaoMedicacaoHandler(
        IPrescricaoMedicacaoRepository prescricaoMedicacaoRepository,
        IMedicacaoAdministradaRepository medicacaoAdministradaRepository)
        : IRequestHandler<DeletePrescricaoMedicacaoCommand>
    {
        public async Task Handle(DeletePrescricaoMedicacaoCommand request, CancellationToken cancellationToken)
        {
            var prescricao = await prescricaoMedicacaoRepository.GetPrescricaoWithDetailsAsync(request.Id);

            if (prescricao == null)
                throw new NotFoundException(nameof(PrescricaoMedicacao), request.Id);

            if (prescricao.Administracoes != null && prescricao.Administracoes.Any(a => a.StatusDose == StatusDose.Concluido))
                throw new BadRequestException("Não é possível excluir a prescrição porque já existem doses administradas registradas.");

            var administracoesPendentes = await medicacaoAdministradaRepository.GetAdministracoesByPrescricaoAsync(request.Id);
            foreach (var adm in administracoesPendentes)
                await medicacaoAdministradaRepository.DeleteAsync(adm);

            await prescricaoMedicacaoRepository.DeleteAsync(prescricao);
        }
    }
}