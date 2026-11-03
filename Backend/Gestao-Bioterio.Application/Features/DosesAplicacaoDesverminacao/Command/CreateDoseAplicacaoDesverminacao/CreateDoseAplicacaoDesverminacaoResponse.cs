using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Command.CreateDoseAplicacaoDesverminacao
{
    public class CreateDoseAplicacaoDesverminacaoResponse : BaseResponse
    {
        public CreateDoseAplicacaoDesverminacaoResponse() : base()
        {
        }
        public int Id { get; set; }
        public CreateDoseAplicacaoDesverminacaoDto DoseAplicacaoDesverminacao { get; set; } = null!;
    }
}