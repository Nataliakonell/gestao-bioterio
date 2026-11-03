using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IPrescricaoMedicacaoRepository : IAsyncRepository<PrescricaoMedicacao>
    {
        Task<List<PrescricaoMedicacao>> GetPrescricoesByAnimalAsync(int animalId);
        Task<PrescricaoMedicacao?> GetPrescricaoWithDetailsAsync(int id);
        Task<List<PrescricaoMedicacao>> GetAllPrescricoesWithDetailsAsync();
    }
}
