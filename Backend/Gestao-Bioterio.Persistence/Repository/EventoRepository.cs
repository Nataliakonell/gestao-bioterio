using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class EventoRepository : BaseRepository<Evento>, IEventoRepository
    {
        public EventoRepository(BioterioDbContext dbContext) : base(dbContext)
        {
        }
    }
}
