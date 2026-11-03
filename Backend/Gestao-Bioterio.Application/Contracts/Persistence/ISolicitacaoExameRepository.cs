using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface ISolicitacaoExameRepository : IAsyncRepository<SolicitacaoExame>
    {
        Task<List<SolicitacaoExame>> GetSolicitacoesByAnimalAsync(int animalId);
        Task<SolicitacaoExame?> GetSolicitacaoWithDetailsAsync(int id);
        Task<int> GetSolicitacoesCountAsync(string? searchTerm = null, int? especieId = null, int? animalId = null);
        Task<IReadOnlyList<SolicitacaoExame>> GetSolicitacaoExameListPaginatedAsync(string? searchTerm = null, int page = 1, int pageSize = 10, int? especieId = null, int? animalId = null);
    }
}
