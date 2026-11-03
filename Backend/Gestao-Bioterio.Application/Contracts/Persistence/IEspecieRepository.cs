using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IEspecieRepository : IAsyncRepository<Especie>
    {
        Task<bool> EspecieIsUnique(string nome, int? excludeId = null);
        Task<IReadOnlyList<Especie>> GetEspeciesWithGrupoAsync();
        Task<int> GetEspeciesCountAsync(string? searchTerm = null);
        Task<IReadOnlyList<Especie>> GetEspeciesListAsync(string? searchTerm = null, int page = 1, int pageSize = 10);
        Task<IReadOnlyList<(int Id, string Nome, string NomePopular)>> GetEspeciesLookupAsync();
    }
}