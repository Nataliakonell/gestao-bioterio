using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.CreatePrescricaoMedicacao
{
    public class CreatePrescricaoMedicacaoResponse : BaseResponse
    {
        public CreatePrescricaoMedicacaoResponse() : base()
        {
        }
        public CreatePrescricaoMedicacaoDto Prescricao { get; set; } = default!;
        public int Id { get; set; }
    }
}