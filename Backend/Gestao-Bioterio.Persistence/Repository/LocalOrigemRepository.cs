using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;

using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class LocalOrigemRepository(BioterioDbContext dbContext) : BaseRepository<LocalOrigem>(dbContext), ILocalOrigemRepository
    {
        public async Task<bool> HasAnimalsLinkedAsync(int localOrigemId)
        {
            return await dbContext.Animals.AnyAsync(a => a.LocalOrigemId == localOrigemId);
        }

        public async Task<bool> IsNomeUnique(string nome, int? excludeId = null)
        {
            var trimmedNome = nome.Trim().ToLower();
            if (excludeId.HasValue)
            {
                return !await dbContext.LocalOrigens.AnyAsync(l => l.Nome.Trim().ToLower() == trimmedNome && l.Id != excludeId.Value);
            }
            return !await dbContext.LocalOrigens.AnyAsync(l => l.Nome.Trim().ToLower() == trimmedNome);
        }

        public async Task<int> GetLocalOrigemCountAsync(string? searchTerm = null)
        {
            var query = dbContext.LocalOrigens.AsQueryable();
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(e => e.Nome.Contains(searchTerm));
            }
            return await query.CountAsync();
        }

        public async Task<IReadOnlyList<LocalOrigem>> GetLocalOrigemListAsync(string? searchTerm = null, int page = 1, int pageSize = 10)
        {
            var query = dbContext.LocalOrigens.AsQueryable();
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

        public async Task<IReadOnlyList<(int Id, string Nome)>> GetLocalOrigemLookupAsync()
        {
            return await dbContext.LocalOrigens
                .AsNoTracking()
                .Where(l => l.Ativo)
                .OrderBy(l => l.Nome)
                .Select(l => new { l.Id, l.Nome })
                .ToListAsync()
                .ContinueWith(t => (IReadOnlyList<(int, string)>)t.Result
                    .Select(x => (x.Id, x.Nome))
                    .ToList());
        }
    }
}
