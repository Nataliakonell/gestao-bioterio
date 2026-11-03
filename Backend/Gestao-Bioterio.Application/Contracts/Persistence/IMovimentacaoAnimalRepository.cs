using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IMovimentacaoAnimalRepository : IAsyncRepository<MovimentacaoAnimal>
    {
        Task<List<MovimentacaoAnimal>> ObterHistoricoPorAnimalIdAsync(int animalId);
    }
}
