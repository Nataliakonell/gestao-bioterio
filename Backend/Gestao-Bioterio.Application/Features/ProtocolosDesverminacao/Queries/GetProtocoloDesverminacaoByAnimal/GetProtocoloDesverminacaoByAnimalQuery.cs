using Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Queries.GetProtocoloDesverminacaoDetail;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Queries.GetProtocoloDesverminacaoByAnimal
{
    public class GetProtocoloDesverminacaoByAnimalQuery : IRequest<ProtocoloDesverminacaoDetailVm>
    {
        public int AnimalId { get; set; }
    }
}