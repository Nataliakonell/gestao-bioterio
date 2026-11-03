using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IMedicacaoAdministradaRepository : IAsyncRepository<MedicacaoAdministrada>
    {
        Task<List<MedicacaoAdministrada>> GetAdministracoesByPrescricaoAsync(int prescricaoId);
        Task<List<MedicacaoAdministrada>> GetAdministracoesByAnimalAsync(int animalId);
        Task<List<MedicacaoAdministrada>> GetAdministracoesPendentesAsync(DateTime? data = null);
        Task<List<MedicacaoAdministrada>> GetAllWithIncludesAsync();
    }
}
