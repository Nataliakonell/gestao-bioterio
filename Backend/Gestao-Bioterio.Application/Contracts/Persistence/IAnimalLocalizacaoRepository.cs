using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IAnimalLocalizacaoRepository : IAsyncRepository<AnimalLocalizacao>
    {
        Task<AnimalLocalizacao?> ObterPorAnimalIdAsync(int animalId);
    }
}
