using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Queries.GetProtocoloDesverminacaoDetail;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Queries.GetProtocoloDesverminacaoByAnimal
{
    public class GetProtocoloDesverminacaoByAnimalHandler(
        IMapper mapper,
        IProtocoloDesverminacaoRepository protocoloRepository)
        : IRequestHandler<GetProtocoloDesverminacaoByAnimalQuery, ProtocoloDesverminacaoDetailVm>
    {
        public async Task<ProtocoloDesverminacaoDetailVm> Handle(GetProtocoloDesverminacaoByAnimalQuery request, CancellationToken cancellationToken)
        {
            var protocolo = await protocoloRepository.GetProtocoloByAnimalAsync(request.AnimalId);

            if (protocolo == null)
                throw new NotFoundException(nameof(ProtocoloDesverminacao), request.AnimalId);

            return mapper.Map<ProtocoloDesverminacaoDetailVm>(protocolo);
        }
    }
}