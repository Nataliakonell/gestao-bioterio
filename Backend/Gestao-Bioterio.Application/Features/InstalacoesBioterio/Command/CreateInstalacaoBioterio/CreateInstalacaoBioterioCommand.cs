using MediatR;

namespace Gestao_Bioterio.Application.Features.InstalacoesBioterio.Command.CreateInstalacaoBioterio
{
    public class CreateInstalacaoBioterioCommand : IRequest<CreateInstalacaoBioterioResponse>
    {
        public string Nome { get; set; } = string.Empty;
    }
}