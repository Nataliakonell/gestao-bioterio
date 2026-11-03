using MediatR;

namespace Gestao_Bioterio.Application.Features.InstalacoesBioterio.Command.UpdateInstalacaoBioterio
{
    public class UpdateInstalacaoBioterioCommand : IRequest
    {
        public int Id { get; set; }
        public string? Nome { get; set; }
    }
}
