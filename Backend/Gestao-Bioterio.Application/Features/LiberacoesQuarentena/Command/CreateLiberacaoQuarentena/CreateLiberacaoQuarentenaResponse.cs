using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.CreateLiberacaoQuarentena
{
    public class CreateLiberacaoQuarentenaResponse : BaseResponse
    {
        public int Id { get; set; }
        public CreateLiberacaoQuarentenaDto? LiberacaoQuarentena { get; set; }
    }
}
