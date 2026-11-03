using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IEvolucaoRepository : IAsyncRepository<Evolucao>
    {
        Task<List<Evolucao>> GetEvolucoesByAnimalAsync(int animalId);
        Task<Evolucao?> GetEvolucaoWithDetailsAsync(int id);
    }
}
