using MediatR;

namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Queries.GetAllProtocolosDesverminacao
{
    public class GetAllProtocolosDesverminacaoQuery : IRequest<List<ProtocoloDesverminacaoListVm>>
    {
    }
}