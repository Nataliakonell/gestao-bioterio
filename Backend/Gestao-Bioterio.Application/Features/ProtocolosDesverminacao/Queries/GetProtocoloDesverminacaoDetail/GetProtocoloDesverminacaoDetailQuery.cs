using MediatR;

namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Queries.GetProtocoloDesverminacaoDetail
{
    public class GetProtocoloDesverminacaoDetailQuery : IRequest<ProtocoloDesverminacaoDetailVm>
    {
        public int Id { get; set; }
    }
}