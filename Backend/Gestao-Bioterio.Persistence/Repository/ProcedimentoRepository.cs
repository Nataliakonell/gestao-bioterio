using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class ProcedimentoRepository : BaseRepository<Procedimento>, IProcedimentoRepository
    {
        public ProcedimentoRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<List<Procedimento>> GetProcedimentosByAnimalAsync(int animalId)
        {
            return await _context.Procedimentos
                .AsNoTracking()
                .Include(p => p.TipoProcedimento)
                .Where(p => p.AnimalId == animalId)
                .OrderByDescending(p => p.Id)
                .ToListAsync();
        }

        public async Task<List<Procedimento>> GetAllWithTipoAsync()
        {
            return await _context.Procedimentos
                .AsNoTracking()
                .Include(p => p.TipoProcedimento)
                .OrderByDescending(p => p.Id)
                .ToListAsync();
        }

        public async Task<Procedimento?> GetByIdWithTipoAsync(int id)
        {
            return await _context.Procedimentos
                .AsNoTracking()
                .Include(p => p.TipoProcedimento)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
    }
}