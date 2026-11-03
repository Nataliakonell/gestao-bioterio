using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface ILiberacaoQuarentenaRepository : IAsyncRepository<LiberacaoQuarentena>
    {
        Task<LiberacaoQuarentena?> GetByAnimalIdAsync(int animalId);
        Task<List<LiberacaoQuarentena>> GetAllByAnimalIdAsync(int? animalId);
    }
}
