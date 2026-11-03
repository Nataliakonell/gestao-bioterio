using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.Refeicoes.Command.CreateRefeicao
{
    public class CreateRefeicaoResponse : BaseResponse
    {
        public CreateRefeicaoResponse() : base()
        {
        }
        public CreateRefeicaoDto Refeicao { get; set; } = default!;
        public int Id { get; set; }
    }
}
