using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IDoseAplicacaoDesverminacaoRepository : IAsyncRepository<DoseAplicacaoDesverminacao>
    {
        Task<List<DoseAplicacaoDesverminacao>> GetDosesByProtocoloAsync(int protocoloId);
        Task<List<DoseAplicacaoDesverminacao>> GetDosesByAnimalAsync(int animalId);
        Task<List<DoseAplicacaoDesverminacao>> GetDosesPendentesAsync(DateTime data);
    }
}
