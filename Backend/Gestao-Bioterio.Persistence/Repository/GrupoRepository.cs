using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class GrupoRepository : BaseRepository<Grupo>, IGrupoRepository
    {
        public GrupoRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<int> GetGrupoCountAsync(string? searchTerm = null)
        {
            var query = _context.Groups.AsQueryable();
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(e => e.Nome.Contains(searchTerm));
            }
            return await query.CountAsync();
        }

        public async Task<IReadOnlyList<Grupo>> GetGrupoListAsync(string? searchTerm = null, int page = 1, int pageSize = 10)
        {
            var query = _context.Groups.AsQueryable();
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(e => e.Nome.Contains(searchTerm));
            }
            return await query
                .OrderBy(e => e.Nome)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IReadOnlyList<(int Id, string Nome)>> GetGrupoLookupAsync()
        {
            return await _context.Groups
                .AsNoTracking()
                .OrderBy(e => e.Nome)
                .Select(e => new { e.Id, e.Nome })
                .ToListAsync()
                .ContinueWith(t => (IReadOnlyList<(int, string)>)t.Result
                    .Select(x => (x.Id, x.Nome))
                    .ToList());
        }
    }
}