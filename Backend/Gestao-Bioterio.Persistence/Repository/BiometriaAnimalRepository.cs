using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class BiometriaAnimalRepository : BaseRepository<BiometriaAnimal>, IBiometriaAnimalRepository
    {
        public BiometriaAnimalRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<List<BiometriaAnimal>> GetBiometriaAsync(int? animalId = null)
        {
            var query = _context.BiometriasAnimais
                .Include(b => b.Animal)
                .ThenInclude(a => a.Especie)
                .AsNoTracking()
                .AsQueryable();

            if (animalId.HasValue)
            {
                query = query.Where(b => b.AnimalId == animalId.Value);
            }

            return await query
                .OrderBy(b => b.Id)
                .ToListAsync();
        }

        public async Task<int> GetBiometriaCountAsync(int? animalId = null, string? searchTerm = null, int? especieId = null, List<int>? faseDeVida = null)
        {
            var query = _context.BiometriasAnimais.AsQueryable();
            if (animalId.HasValue) 
            {
                query = query.Where(b => b.AnimalId == animalId.Value);
            }
            else
            {
                query = query.Where(b => b.Id == _context.BiometriasAnimais
                    .Where(sub => sub.AnimalId == b.AnimalId)
                    .OrderByDescending(sub => sub.DataBiometria)
                    .ThenByDescending(sub => sub.Id)
                    .Select(sub => sub.Id)
                    .FirstOrDefault());
            }
            
            if (especieId.HasValue) query = query.Where(b => b.Animal.EspecieId == especieId.Value);
            if (faseDeVida != null && faseDeVida.Count > 0)
            {
                var fases = faseDeVida.Select(f => (FaseDeVida)f).ToList();
                query = query.Where(b => fases.Contains(b.Animal.FaseDeVida));
            }
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.ToLower();
                query = query.Where(b => 
                    b.Animal.NumeroRegistro.ToLower().Contains(term) || 
                    (b.Animal.Especie != null && b.Animal.Especie.Nome.ToLower().Contains(term)) ||
                    b.Animal.NomePopular.ToLower().Contains(term) ||
                    b.Animal.NumeroChip.ToLower().Contains(term));
            }
            return await query.CountAsync();
        }

        public async Task<List<BiometriaAnimal>> GetBiometriaListPaginatedAsync(int? animalId = null, string? searchTerm = null, int? especieId = null, List<int>? faseDeVida = null, int page = 1, int pageSize = 10)
        {
            var query = _context.BiometriasAnimais
                .Include(b => b.Animal)
                .ThenInclude(a => a.Especie)
                .AsNoTracking()
                .AsQueryable();

            if (animalId.HasValue) 
            {
                query = query.Where(b => b.AnimalId == animalId.Value);
            }
            else
            {
                query = query.Where(b => b.Id == _context.BiometriasAnimais
                    .Where(sub => sub.AnimalId == b.AnimalId)
                    .OrderByDescending(sub => sub.DataBiometria)
                    .ThenByDescending(sub => sub.Id)
                    .Select(sub => sub.Id)
                    .FirstOrDefault());
            }
            
            if (especieId.HasValue) query = query.Where(b => b.Animal.EspecieId == especieId.Value);
            if (faseDeVida != null && faseDeVida.Count > 0)
            {
                var fases = faseDeVida.Select(f => (FaseDeVida)f).ToList();
                query = query.Where(b => fases.Contains(b.Animal.FaseDeVida));
            }
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.ToLower();
                query = query.Where(b => 
                    b.Animal.NumeroRegistro.ToLower().Contains(term) || 
                    (b.Animal.Especie != null && b.Animal.Especie.Nome.ToLower().Contains(term)) ||
                    b.Animal.NomePopular.ToLower().Contains(term) ||
                    b.Animal.NumeroChip.ToLower().Contains(term));
            }

            return await query
                .OrderByDescending(b => b.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<BiometriaAnimal?> GetBiometriaWithDetailsAsync(int id)
        {
            return await _context.BiometriasAnimais
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<Dictionary<int, BiometriaAnimal?>> GetUltimasBiometriasAsync(IEnumerable<int> animalIds)
        {
            var ids = new HashSet<int>(animalIds);
            var todas = await _context.BiometriasAnimais
                .Where(b => ids.Contains(b.AnimalId))
                .AsNoTracking()
                .ToListAsync();

            return todas
                .GroupBy(b => b.AnimalId)
                .ToDictionary(g => g.Key, g => g.OrderByDescending(b => b.DataBiometria).FirstOrDefault());
        }

        public async Task<BiometriaAnimal?> GetUltimaBiometriaAsync(int animalId)
        {
            return await _context.BiometriasAnimais
                .Where(b => b.AnimalId == animalId)
                .OrderByDescending(b => b.DataBiometria)
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }
    }
}
