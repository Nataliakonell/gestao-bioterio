using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Queries.GetProtocoloDesverminacaoDetail
{
    public class GetProtocoloDesverminacaoDetailHandler(
        IMapper mapper,
        IProtocoloDesverminacaoRepository protocoloRepository)
        : IRequestHandler<GetProtocoloDesverminacaoDetailQuery, ProtocoloDesverminacaoDetailVm>
    {
        public async Task<ProtocoloDesverminacaoDetailVm> Handle(GetProtocoloDesverminacaoDetailQuery request, CancellationToken cancellationToken)
        {
            var protocolo = await protocoloRepository.GetProtocoloWithDosesAsync(request.Id);

            if (protocolo == null)
                throw new NotFoundException(nameof(ProtocoloDesverminacao), request.Id);

            return mapper.Map<ProtocoloDesverminacaoDetailVm>(protocolo);
        }
    }
}