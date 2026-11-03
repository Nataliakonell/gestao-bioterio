using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class RotinaAnimalRepository : BaseRepository<RotinaAnimal>, IRotinaAnimalRepository
    {
        public RotinaAnimalRepository(BioterioDbContext context)
            : base(context)
        {
        }

        public async Task<bool> ExisteRotinaAsync(int especieId, TipoRotina tipoRotina, FaseDeVida faseDeVida)
        {
            return await _context.RotinasAnimais
                .AnyAsync(x =>
                    x.EspecieId == especieId &&
                    x.TipoRotina == tipoRotina &&
                    x.FaseDeVida == faseDeVida);
        }

        public async Task<List<RotinaAnimal>> GetRotinaaAsync(int? especieId = null)
        {
            var query = _context.RotinasAnimais
                .Include(x => x.Especie)
                .AsQueryable();

            if (especieId.HasValue)
                query = query.Where(x => x.EspecieId == especieId);

            return await query.ToListAsync();
        }

        public async Task<List<RotinaAnimal>> GetAllWithEspecieAsync()
        {
            return await _context.RotinasAnimais
                .Include(x => x.Especie)
                .OrderBy(x => x.EspecieId)
                .ThenBy(x => x.TipoRotina)
                .ToListAsync();
        }

        public async Task<List<RotinaAnimal>> GetRotinasByEspecieAsync(int especieId)
        {
            return await _context.RotinasAnimais
                .Where(x => x.EspecieId == especieId)
                .ToListAsync();
        }

        public async Task<RotinaAnimal?> GetRotinaAsync(int especieId)
        {
            return await _context.RotinasAnimais
                .FirstOrDefaultAsync(x => x.EspecieId == especieId);
        }

        public async Task<RotinaAnimal?> GetRotinaWithDetailsAsync(int id)
        {
            return await _context.RotinasAnimais
                .Include(x => x.Especie)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<RotinaAnimal>> GetRotinasByEspecieTipoAsync(int especieId, TipoRotina tipoRotina)
        {
            return await _context.RotinasAnimais
                .Include(x => x.Especie)
                .Where(x => x.EspecieId == especieId && x.TipoRotina == tipoRotina)
                .ToListAsync();
        }

        public async Task<int> GetRotinasAnimaisCountAsync(string? searchTerm = null, int? especieId = null, List<int>? faseDeVidas = null)
        {
            var query = _context.RotinasAnimais.Include(x => x.Especie).AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var searchLower = searchTerm.ToLower();
                query = query.Where(x => 
                    x.Especie.Nome.ToLower().Contains(searchLower) ||
                    x.Especie.NomePopular.ToLower().Contains(searchLower)
                );
            }

            if (especieId.HasValue)
                query = query.Where(x => x.EspecieId == especieId.Value);

            if (faseDeVidas != null && faseDeVidas.Count > 0)
            {
                var fases = faseDeVidas.Select(f => (FaseDeVida)f).ToList();
                query = query.Where(x => fases.Contains(x.FaseDeVida));
            }

            return await query.CountAsync();
        }

        public async Task<IReadOnlyList<RotinaAnimal>> GetRotinasAnimaisListPaginatedAsync(string? searchTerm = null, int page = 1, int pageSize = 10, int? especieId = null, List<int>? faseDeVidas = null)
        {
            var query = _context.RotinasAnimais.Include(x => x.Especie).AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var searchLower = searchTerm.ToLower();
                query = query.Where(x => 
                    x.Especie.Nome.ToLower().Contains(searchLower) ||
                    x.Especie.NomePopular.ToLower().Contains(searchLower)
                );
            }

            if (especieId.HasValue)
                query = query.Where(x => x.EspecieId == especieId.Value);

            if (faseDeVidas != null && faseDeVidas.Count > 0)
            {
                var fases = faseDeVidas.Select(f => (FaseDeVida)f).ToList();
                query = query.Where(x => fases.Contains(x.FaseDeVida));
            }

            return await query
                .OrderBy(x => x.EspecieId)
                .ThenBy(x => x.TipoRotina)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
}
