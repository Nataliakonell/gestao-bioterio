using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IMedicacaoRepository : IAsyncRepository<Medicacao>
    {
        Task<List<Medicacao>> GetMedicacoesAtivasAsync();
        Task<IReadOnlyList<(int Id, string PrincipioAtivo, string NomeComercial)>> GetMedicacaoLookupAsync();
        Task<bool> IsUniqueAsync(string principioAtivo, string nomeComercial, int? idToIgnore = null);
    }
}
