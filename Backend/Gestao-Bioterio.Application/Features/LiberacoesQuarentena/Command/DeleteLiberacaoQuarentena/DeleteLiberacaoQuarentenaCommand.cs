using MediatR;

namespace Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.DeleteLiberacaoQuarentena
{
    public class DeleteLiberacaoQuarentenaCommand : IRequest
    {
        public int Id { get; set; }
    }
}
