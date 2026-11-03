using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class AltaAmbulatoriaRepository : BaseRepository<AltaAmbulatorial>, IAltaAmbulatoriaRepository
    {
        public AltaAmbulatoriaRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<AltaAmbulatorial?> GetByAnimalIdAsync(int animalId)
        {
            return await _context.AltaAmbulatoriais
                .AsNoTracking()
                .Include(a => a.Animal)
                .Include(a => a.InstalacaoBioterioRetorno)
                .Where(a => a.AnimalId == animalId)
                .OrderByDescending(a => a.DataAltaClinica)
                .ThenByDescending(a => a.DataCriacao)
                .FirstOrDefaultAsync();
        }

        public async Task<List<AltaAmbulatorial>> GetAllByAnimalIdAsync(int? animalId)
        {
            var query = _context.AltaAmbulatoriais
                .AsNoTracking()
                .Include(a => a.Animal)
                .Include(a => a.InstalacaoBioterioRetorno)
                .AsQueryable();

            if (animalId.HasValue && animalId.Value > 0)
            {
                query = query.Where(a => a.AnimalId == animalId.Value);
            }

            return await query
                .OrderByDescending(a => a.DataAltaClinica)
                .ThenByDescending(a => a.DataCriacao)
                .ToListAsync();
        }

        public async Task<AltaAmbulatorial?> GetByIdWithDetailsAsync(int id)
        {
            return await _context.AltaAmbulatoriais
                .AsNoTracking()
                .Include(a => a.Animal)
                .Include(a => a.InstalacaoBioterioRetorno)
                .FirstOrDefaultAsync(a => a.Id == id);
        }
    }
}
