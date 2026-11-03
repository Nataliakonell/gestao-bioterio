using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IAlimentacaoRepository : IAsyncRepository<Alimentacao>
    {
        Task<List<Alimentacao>> GetAlimentacoesAsync(int? animalId = null);
        Task<int> GetAlimentacoesCountAsync(int? animalId = null, string? searchTerm = null, int? especieId = null, List<int>? faseDeVida = null, List<int>? status = null, DateTime? dataInicial = null, DateTime? dataFinal = null);
        Task<List<Alimentacao>> GetAlimentacoesListPaginatedAsync(int? animalId = null, string? searchTerm = null, int? especieId = null, List<int>? faseDeVida = null, List<int>? status = null, int page = 1, int pageSize = 10, DateTime? dataInicial = null, DateTime? dataFinal = null);
        Task<Alimentacao?> GetAlimentacaoWithDetailsAsync(int id);
        Task<Alimentacao?> GetUltimaAlimentacaoAsync(int animalId);
        Task<Dictionary<int, Alimentacao?>> GetUltimasAlimentacoesAsync(IEnumerable<int> animalIds);
        Task<Dictionary<int, List<Alimentacao>>> GetAlimentacoesSinceAsync(IEnumerable<int> animalIds, DateTime sinceDate);
        Task SaveAlimentacaoUpdateAsync();
    }
}
