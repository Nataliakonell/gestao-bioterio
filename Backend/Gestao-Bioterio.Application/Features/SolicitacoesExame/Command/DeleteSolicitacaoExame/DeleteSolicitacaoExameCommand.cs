using MediatR;

namespace Gestao_Bioterio.Application.Features.SolicitacoesExame.Command.DeleteSolicitacaoExame
{
    public class DeleteSolicitacaoExameCommand : IRequest
    {
        public int Id { get; set; }
    }
}