using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class SolicitacaoExameRepository : BaseRepository<SolicitacaoExame>, ISolicitacaoExameRepository
    {
        public SolicitacaoExameRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<List<SolicitacaoExame>> GetSolicitacoesByAnimalAsync(int animalId)
        {
            return await _context.SolicitacoesExame
                .AsNoTracking()
                .Where(s => s.AnimalId == animalId)
                .OrderByDescending(s => s.Id)
                .ToListAsync();
        }

        public async Task<SolicitacaoExame?> GetSolicitacaoWithDetailsAsync(int id)
        {
            return await _context.SolicitacoesExame
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<int> GetSolicitacoesCountAsync(string? searchTerm = null, int? especieId = null, int? animalId = null)
        {
            var query = _context.SolicitacoesExame
                .AsNoTracking()
                .AsQueryable();

            if (animalId.HasValue)
                query = query.Where(s => s.AnimalId == animalId.Value);

            return await query.CountAsync();
        }

        public async Task<IReadOnlyList<SolicitacaoExame>> GetSolicitacaoExameListPaginatedAsync(string? searchTerm = null, int page = 1, int pageSize = 10, int? especieId = null, int? animalId = null)
        {
            var query = _context.SolicitacoesExame
                .AsNoTracking()
                .AsQueryable();

            if (animalId.HasValue)
                query = query.Where(s => s.AnimalId == animalId.Value);

            return await query
                .OrderByDescending(s => s.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
}