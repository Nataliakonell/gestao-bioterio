using MediatR;

namespace Gestao_Bioterio.Application.Features.InstalacoesBioterio.Command.DeleteInstalacaoBioterio
{
    public class DeleteLiberacaoQuarentenaCommand : IRequest
    {
        public int Id { get; set; }
    }
}

