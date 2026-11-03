using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class EvolucaoRepository : BaseRepository<Evolucao>, IEvolucaoRepository
    {
        public EvolucaoRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<List<Evolucao>> GetEvolucoesByAnimalAsync(int animalId)
        {
            return await _context.Evolucoes
                .AsNoTracking()
                .Where(e => e.AnimalId == animalId)
                .OrderByDescending(e => e.DataHoraRegistro)
                .ToListAsync();
        }

        public async Task<Evolucao?> GetEvolucaoWithDetailsAsync(int id)
        {
            return await _context.Evolucoes
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);
        }
    }
}