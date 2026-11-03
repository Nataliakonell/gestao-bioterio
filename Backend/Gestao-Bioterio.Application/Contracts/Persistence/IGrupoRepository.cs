using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IGrupoRepository : IAsyncRepository<Grupo>
    {
        Task<int> GetGrupoCountAsync(string? searchTerm = null);
        Task<IReadOnlyList<Grupo>> GetGrupoListAsync(string? searchTerm = null, int page = 1, int pageSize = 10);
        Task<IReadOnlyList<(int Id, string Nome)>> GetGrupoLookupAsync();
    }
}
