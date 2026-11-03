using MediatR;

namespace Gestao_Bioterio.Application.Features.Evolucoes.Queries.GetAllEvolucoes
{
    public class GetAllEvolucoesQuery : IRequest<List<EvolucaoListVm>>
    {
        public int? AnimalId { get; set; }
    }
}