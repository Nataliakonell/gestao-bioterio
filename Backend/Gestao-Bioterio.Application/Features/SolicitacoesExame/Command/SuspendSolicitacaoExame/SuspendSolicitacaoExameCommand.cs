using MediatR;

namespace Gestao_Bioterio.Application.Features.SolicitacoesExame.Command.SuspendSolicitacaoExame
{
    public class SuspendSolicitacaoExameCommand : IRequest<SuspendSolicitacaoExameResponse>
    {
        public int Id { get; set; }
        public string MotivoSuspensao { get; set; } = string.Empty;
    }
}
