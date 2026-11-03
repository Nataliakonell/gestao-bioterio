using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IBiometriaAnimalRepository : IAsyncRepository<BiometriaAnimal>
    {
        Task<List<BiometriaAnimal>> GetBiometriaAsync(int? animalId = null);
        Task<int> GetBiometriaCountAsync(int? animalId = null, string? searchTerm = null, int? especieId = null, List<int>? faseDeVida = null);
        Task<List<BiometriaAnimal>> GetBiometriaListPaginatedAsync(int? animalId = null, string? searchTerm = null, int? especieId = null, List<int>? faseDeVida = null, int page = 1, int pageSize = 10);
        Task<BiometriaAnimal?> GetBiometriaWithDetailsAsync(int id);
        Task<BiometriaAnimal?> GetUltimaBiometriaAsync(int animalId);
        Task<Dictionary<int, BiometriaAnimal?>> GetUltimasBiometriasAsync(IEnumerable<int> animalIds);
    }
}
