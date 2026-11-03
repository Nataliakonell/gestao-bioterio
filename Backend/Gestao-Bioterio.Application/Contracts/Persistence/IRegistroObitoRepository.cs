using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IRegistroObitoRepository : IAsyncRepository<RegistroObito>
    {
        Task<RegistroObito?> GetByAnimalIdAsync(int animalId);
        Task<List<RegistroObito>> GetAllByAnimalIdAsync(int? animalId);
    }
}
