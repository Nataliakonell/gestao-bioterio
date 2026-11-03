using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class RegistroObitoRepository : BaseRepository<RegistroObito>, IRegistroObitoRepository
    {
        public RegistroObitoRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<RegistroObito?> GetByAnimalIdAsync(int animalId)
        {
            return await _context.RegistrosObito
                .AsNoTracking()
                .Include(x => x.Animal)
                .Where(x => x.AnimalId == animalId)
                .OrderByDescending(x => x.DataObito)
                .ThenByDescending(x => x.DataCriacao)
                .FirstOrDefaultAsync();
        }

        public async Task<List<RegistroObito>> GetAllByAnimalIdAsync(int? animalId)
        {
            var query = _context.RegistrosObito
                .AsNoTracking()
                .Include(x => x.Animal)
                .AsQueryable();

            if (animalId.HasValue && animalId.Value > 0)
            {
                query = query.Where(x => x.AnimalId == animalId.Value);
            }

            return await query
                .OrderByDescending(x => x.DataObito)
                .ThenByDescending(x => x.DataCriacao)
                .ToListAsync();
        }
    }
}
