using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.InstalacoesBioterio.Command.CreateInstalacaoBioterio
{
    public class CreateInstalacaoBioterioResponse : BaseResponse
    {
        public CreateInstalacaoBioterioResponse(): base()
        {
        }
        public CreateInstalacaoBioterioDto InstalacaoBioterio { get; set; } = default!;
        public int Id { get; set; }
    }
}
