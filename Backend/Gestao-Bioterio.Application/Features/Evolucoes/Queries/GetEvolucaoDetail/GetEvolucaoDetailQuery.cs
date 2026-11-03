using MediatR;

namespace Gestao_Bioterio.Application.Features.Evolucoes.Queries.GetEvolucaoDetail
{
    public class GetEvolucaoDetailQuery : IRequest<EvolucaoDetailVm>
    {
        public int Id { get; set; }
    }
}