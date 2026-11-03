using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.SolicitacoesExame.Command.CreateSolicitacaoExame
{
    public class CreateSolicitacaoExameResponse : BaseResponse
    {
        public CreateSolicitacaoExameResponse() : base()
        {
        }
        public int Id { get; set; }
        public CreateSolicitacaoExameDto SolicitacaoExame { get; set; } = null!;
    }
}