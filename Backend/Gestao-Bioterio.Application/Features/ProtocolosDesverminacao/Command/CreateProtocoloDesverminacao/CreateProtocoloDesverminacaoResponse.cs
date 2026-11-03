using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Command.CreateProtocoloDesverminacao
{
    public class CreateProtocoloDesverminacaoResponse : BaseResponse
    {
        public CreateProtocoloDesverminacaoResponse() : base()
        {
        }
        public int Id { get; set; }
        public CreateProtocoloDesverminacaoDto ProtocoloDesverminacao { get; set; } = null!;
    }
}