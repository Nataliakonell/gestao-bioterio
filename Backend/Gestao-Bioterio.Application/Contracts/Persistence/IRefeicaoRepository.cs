using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IRefeicaoRepository : IAsyncRepository<Refeicao>
    {
        Task<List<Refeicao>> GetRefeicaoAsync(int? alimentacaoId = null);

        Task<Refeicao?> GetRefeicaoWithDetailsAsync(int id);
    }
}
