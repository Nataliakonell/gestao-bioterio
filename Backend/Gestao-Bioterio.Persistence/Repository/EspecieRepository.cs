using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class EspecieRepository : BaseRepository<Especie>, IEspecieRepository
    {
        public EspecieRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<bool> EspecieIsUnique(string nome, int? excludeId = null)
        {
            if (string.IsNullOrWhiteSpace(nome)) return true;
            var target = nome.Trim().ToLower();
            if (excludeId.HasValue)
            {
                return !await _context.Especies.AnyAsync(e => e.Nome.ToLower() == target && e.Id != excludeId.Value);
            }
            return !await _context.Especies.AnyAsync(e => e.Nome.ToLower() == target);
        }

        public async Task<IReadOnlyList<Especie>> GetEspeciesWithGrupoAsync()
        {
            return await _context.Especies
                .Include(e => e.Grupo)
                .ToListAsync();
        }

        public async Task<int> GetEspeciesCountAsync(string? searchTerm = null)
        {
            var query = _context.Especies.AsQueryable();
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(e => e.Nome.Contains(searchTerm) || (e.NomePopular != null && e.NomePopular.Contains(searchTerm)));
            }
            return await query.CountAsync();
        }

        public async Task<IReadOnlyList<Especie>> GetEspeciesListAsync(string? searchTerm = null, int page = 1, int pageSize = 10)
        {
            var query = _context.Especies.Include(e => e.Grupo).AsQueryable();
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(e => e.Nome.Contains(searchTerm) || (e.NomePopular != null && e.NomePopular.Contains(searchTerm)));
            }
            return await query
                .OrderBy(e => e.Nome)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IReadOnlyList<(int Id, string Nome, string NomePopular)>> GetEspeciesLookupAsync()
        {
            return await _context.Especies
                .AsNoTracking()
                .OrderBy(e => e.Nome)
                .Select(e => new { e.Id, e.Nome, e.NomePopular })
                .ToListAsync()
                .ContinueWith(t => (IReadOnlyList<(int, string, string)>)t.Result
                    .Select(x => (x.Id, x.Nome, x.NomePopular ?? string.Empty))
                    .ToList());
        }
    }
}