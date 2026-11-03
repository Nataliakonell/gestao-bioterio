using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using static Gestao_Bioterio.Domain.Entities.Alimentacao;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class AlimentacaoRepository : BaseRepository<Alimentacao>, IAlimentacaoRepository
    {
        public AlimentacaoRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<List<Alimentacao>> GetAlimentacoesAsync(int? animalId = null)
        {
            var query = _context.Alimentacoes
                .Include(a => a.Refeicoes)
                .Include(a => a.BiometriaAnimal)
                .Include(a => a.Animal)
                .ThenInclude(an => an.Especie)
                .AsNoTracking()
                .AsQueryable();

            if (animalId.HasValue)
            {
                query = query.Where(a => a.AnimalId == animalId.Value);
            }

            return await query
                .OrderByDescending(a => a.DataAlimentacao)
                .ToListAsync();
        }

        public async Task<int> GetAlimentacoesCountAsync(int? animalId = null, string? searchTerm = null, int? especieId = null, List<int>? faseDeVida = null, List<int>? status = null, DateTime? dataInicial = null, DateTime? dataFinal = null)
        {
            var query = _context.Alimentacoes.AsQueryable();
            if (animalId.HasValue) 
            {
                query = query.Where(a => a.AnimalId == animalId.Value);
            }
            
            if (especieId.HasValue) query = query.Where(a => a.Animal.EspecieId == especieId.Value);
            if (faseDeVida != null && faseDeVida.Count > 0)
            {
                var fases = faseDeVida.Select(f => (FaseDeVida)f).ToList();
                query = query.Where(a => fases.Contains(a.Animal.FaseDeVida));
            }
            if (status != null && status.Count > 0)
            {
                var statusEnums = status.Select(s => (StatusAlimentacao)s).ToList();
                query = query.Where(a => statusEnums.Contains(a.Status));
            }
            if (dataInicial.HasValue) query = query.Where(a => a.DataAlimentacao >= dataInicial.Value.Date);
            if (dataFinal.HasValue) query = query.Where(a => a.DataAlimentacao < dataFinal.Value.Date.AddDays(1));
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.ToLower();
                query = query.Where(a => 
                    a.Animal.NumeroRegistro.ToLower().Contains(term) || 
                    (a.Animal.Especie != null && a.Animal.Especie.Nome.ToLower().Contains(term)) ||
                    a.Animal.NomePopular.ToLower().Contains(term) ||
                    a.Animal.NumeroChip.ToLower().Contains(term) ||
                    (a.Observacoes != null && a.Observacoes.ToLower().Contains(term)));
            }
            return await query.CountAsync();
        }

        public async Task<List<Alimentacao>> GetAlimentacoesListPaginatedAsync(int? animalId = null, string? searchTerm = null, int? especieId = null, List<int>? faseDeVida = null, List<int>? status = null, int page = 1, int pageSize = 10, DateTime? dataInicial = null, DateTime? dataFinal = null)
        {
            var query = _context.Alimentacoes
                .Include(a => a.Refeicoes)
                .Include(a => a.BiometriaAnimal)
                .Include(a => a.Animal)
                .ThenInclude(an => an.Especie)
                .AsNoTracking()
                .AsQueryable();

            if (animalId.HasValue) 
            {
                query = query.Where(a => a.AnimalId == animalId.Value);
            }
            
            if (especieId.HasValue) query = query.Where(a => a.Animal.EspecieId == especieId.Value);
            if (faseDeVida != null && faseDeVida.Count > 0)
            {
                var fases = faseDeVida.Select(f => (FaseDeVida)f).ToList();
                query = query.Where(a => fases.Contains(a.Animal.FaseDeVida));
            }
            if (status != null && status.Count > 0)
            {
                var statusEnums = status.Select(s => (StatusAlimentacao)s).ToList();
                query = query.Where(a => statusEnums.Contains(a.Status));
            }
            if (dataInicial.HasValue) query = query.Where(a => a.DataAlimentacao >= dataInicial.Value.Date);
            if (dataFinal.HasValue) query = query.Where(a => a.DataAlimentacao < dataFinal.Value.Date.AddDays(1));
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.ToLower();
                query = query.Where(a => 
                    a.Animal.NumeroRegistro.ToLower().Contains(term) || 
                    (a.Animal.Especie != null && a.Animal.Especie.Nome.ToLower().Contains(term)) ||
                    a.Animal.NomePopular.ToLower().Contains(term) ||
                    a.Animal.NumeroChip.ToLower().Contains(term) ||
                    (a.Observacoes != null && a.Observacoes.ToLower().Contains(term)));
            }

            return await query
                .OrderByDescending(a => a.DataAlimentacao)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<Alimentacao?> GetAlimentacaoWithDetailsAsync(int id)
        {
            return await _context.Alimentacoes
                .Include(a => a.Refeicoes)
                .Include(a => a.BiometriaAnimal)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<Alimentacao?> GetUltimaAlimentacaoAsync(int animalId)
        {
            return await _context.Alimentacoes
                .Where(a => a.AnimalId == animalId)
                .OrderByDescending(a => a.DataAlimentacao)
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }

        public async Task<Dictionary<int, Alimentacao?>> GetUltimasAlimentacoesAsync(IEnumerable<int> animalIds)
        {
            var ids = new HashSet<int>(animalIds);
            var todas = await _context.Alimentacoes
                .Where(a => ids.Contains(a.AnimalId))
                .AsNoTracking()
                .ToListAsync();

            return todas
                .GroupBy(a => a.AnimalId)
                .ToDictionary(g => g.Key, g => g.OrderByDescending(a => a.DataAlimentacao).FirstOrDefault());
        }

        public async Task<Dictionary<int, List<Alimentacao>>> GetAlimentacoesSinceAsync(IEnumerable<int> animalIds, DateTime sinceDate)
        {
            var ids = new HashSet<int>(animalIds);
            var records = await _context.Alimentacoes
                .Where(a => ids.Contains(a.AnimalId) && a.DataAlimentacao >= sinceDate)
                .AsNoTracking()
                .ToListAsync();

            return records
                .GroupBy(a => a.AnimalId)
                .ToDictionary(g => g.Key, g => g.ToList());
        }

        public async Task SaveAlimentacaoUpdateAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
