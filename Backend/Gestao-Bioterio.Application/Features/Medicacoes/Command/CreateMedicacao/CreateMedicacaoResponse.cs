using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.Medicacoes.Command.CreateMedicacao
{
    public class CreateMedicacaoResponse : BaseResponse
    {
        public CreateMedicacaoResponse() : base()
        {
        }
        public CreateMedicacaoDto Medicacao { get; set; } = default!;
        public int Id { get; set; }
    }
}