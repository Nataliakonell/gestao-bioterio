using MediatR;

namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Command.DeleteProtocoloDesverminacao
{
    public class DeleteProtocoloDesverminacaoCommand : IRequest
    {
        public int Id { get; set; }
    }
}