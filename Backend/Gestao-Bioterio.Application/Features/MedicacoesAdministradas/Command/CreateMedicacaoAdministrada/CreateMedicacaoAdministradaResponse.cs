using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Command.CreateMedicacaoAdministrada
{
    public class CreateMedicacaoAdministradaResponse : BaseResponse
    {
        public CreateMedicacaoAdministradaResponse() : base()
        {
        }
        public CreateMedicacaoAdministradaDto Administracao { get; set; } = default!;
        public int Id { get; set; }
    }
}