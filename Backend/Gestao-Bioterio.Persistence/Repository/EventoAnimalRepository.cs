using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class EventoAnimalRepository : BaseRepository<EventoAnimal>, IEventoAnimalRepository
    {
        public EventoAnimalRepository(BioterioDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<List<EventoAnimal>> ObterPorEventoIdAsync(int eventoId)
        {
            return await _context.EventosAnimais
                .AsNoTracking()
                .Where(x => x.EventoId == eventoId)
                .ToListAsync();
        }
    }
}
