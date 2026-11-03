using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IAnexoRepository : IAsyncRepository<Anexo>
    {
        Task<List<Anexo>> GetAnexosByAnimalAsync(int animalId);
    }
}
