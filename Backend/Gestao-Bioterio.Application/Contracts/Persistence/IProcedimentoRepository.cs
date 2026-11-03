using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IProcedimentoRepository : IAsyncRepository<Procedimento>
    {
        Task<List<Procedimento>> GetProcedimentosByAnimalAsync(int animalId);
        Task<List<Procedimento>> GetAllWithTipoAsync();
        Task<Procedimento?> GetByIdWithTipoAsync(int id);
    }
}
