using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IAltaAmbulatoriaRepository : IAsyncRepository<AltaAmbulatorial>
    {
        Task<AltaAmbulatorial?> GetByAnimalIdAsync(int animalId);
        Task<List<AltaAmbulatorial>> GetAllByAnimalIdAsync(int? animalId);
        Task<AltaAmbulatorial?> GetByIdWithDetailsAsync(int id);
    }
}
