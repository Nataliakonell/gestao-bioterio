using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IRotinaAnimalRepository : IAsyncRepository<RotinaAnimal>
    {
        Task<List<RotinaAnimal>> GetRotinaaAsync(int? especieId = null);
        Task<List<RotinaAnimal>> GetAllWithEspecieAsync();
        Task<List<RotinaAnimal>> GetRotinasByEspecieAsync(int especieId);
        Task<RotinaAnimal?> GetRotinaAsync(int especieId);
        Task<RotinaAnimal?> GetRotinaWithDetailsAsync(int id);
        Task<List<RotinaAnimal>> GetRotinasByEspecieTipoAsync(int especieId, TipoRotina tipoRotina);
        Task<bool> ExisteRotinaAsync(int especieId, TipoRotina tipoRotina, FaseDeVida faseDeVida);
        Task<int> GetRotinasAnimaisCountAsync(string? searchTerm = null, int? especieId = null, List<int>? faseDeVidas = null);
        Task<IReadOnlyList<RotinaAnimal>> GetRotinasAnimaisListPaginatedAsync(string? searchTerm = null, int page = 1, int pageSize = 10, int? especieId = null, List<int>? faseDeVidas = null);
    }
}
