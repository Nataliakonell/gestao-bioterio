using MediatR;

namespace Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.SuspendPrescricaoMedicacao
{
    public class SuspendPrescricaoMedicacaoCommand : IRequest<SuspendPrescricaoMedicacaoResponse>
    {
        public int Id { get; set; }
        public string MotivoSuspensao { get; set; } = string.Empty;
    }
}
