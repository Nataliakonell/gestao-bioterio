using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Queries.GetAllProtocolosDesverminacao
{
    public class GetAllProtocolosDesverminacaoHandler(
        IMapper mapper,
        IProtocoloDesverminacaoRepository protocoloRepository)
        : IRequestHandler<GetAllProtocolosDesverminacaoQuery, List<ProtocoloDesverminacaoListVm>>
    {
        public async Task<List<ProtocoloDesverminacaoListVm>> Handle(GetAllProtocolosDesverminacaoQuery request, CancellationToken cancellationToken)
        {
            var protocolos = await protocoloRepository.GetProtocolosAsync();
            return mapper.Map<List<ProtocoloDesverminacaoListVm>>(protocolos);
        }
    }
}