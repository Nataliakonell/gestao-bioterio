using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface ILocalOrigemRepository : IAsyncRepository<LocalOrigem>
    {
        Task<bool> HasAnimalsLinkedAsync(int localOrigemId);
        Task<bool> IsNomeUnique(string nome, int? excludeId = null);
        Task<int> GetLocalOrigemCountAsync(string? searchTerm = null);
        Task<IReadOnlyList<LocalOrigem>> GetLocalOrigemListAsync(string? searchTerm = null, int page = 1, int pageSize = 10);
        Task<IReadOnlyList<(int Id, string Nome)>> GetLocalOrigemLookupAsync();
    }
}
