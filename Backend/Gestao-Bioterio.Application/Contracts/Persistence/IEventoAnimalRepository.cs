using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IEventoAnimalRepository : IAsyncRepository<EventoAnimal>
    {
        Task<List<EventoAnimal>> ObterPorEventoIdAsync(int eventoId);
    }
}
