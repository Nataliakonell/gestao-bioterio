using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.Localizacoes.Command.CreateLocalizacao
{
    public class CreateLocalizacaoResponse : BaseResponse
    {
        public CreateLocalizacaoResponse() : base()
        {
        }
        public int Id { get; set; }
        public CreateLocalizacaoDto Localizacao { get; set; } = default!;
    }
}
