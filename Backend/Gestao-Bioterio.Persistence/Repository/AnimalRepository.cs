using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class AnimalRepository : BaseRepository<Animal>, IAnimalRepository
    {
        public AnimalRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<Animal?> GetAnimalWithDetailsAsync(int id)
        {
            var animal = await _context.Animals
                .Include(a => a.Especie)
                    .ThenInclude(e => e.Grupo)
                .Include(a => a.InstalacaoBioterio)
                .Include(a => a.AnimalLocalizacao)
                    .ThenInclude(al => al.Localizacao)
                .Include(a => a.LocalOrigem)
                .Include(a => a.BiometriaAnimais)
                .FirstOrDefaultAsync(a => a.Id == id);

            return animal;
        }

        public async Task<bool> NumeroRegistroIsUnique(string numeroRegistro)
        {
            return !await _context.Animals.AnyAsync(a => a.NumeroRegistro == numeroRegistro);
        }

        public async Task<bool> NumeroChipIsUnique(string numeroChip)
        {
            return !await _context.Animals.AnyAsync(a => a.NumeroChip == numeroChip);
        }

        private IQueryable<Animal> BuildFilterQuery(
            int? especieId,
            int? localizacaoId,
            Genero? genero,
            Situacao? situacao,
            bool? sisfauna,
            string? searchTerm,
            List<int>? faseDeVida = null)
        {
            var query = _context.Animals
                .Include(a => a.Especie)
                    .ThenInclude(e => e.Grupo)
                .Include(a => a.InstalacaoBioterio)
                .Include(a => a.AnimalLocalizacao)
                    .ThenInclude(al => al.Localizacao)
                .Include(a => a.LocalOrigem)
                .Include(a => a.BiometriaAnimais)
                .AsNoTracking()
                .AsQueryable();

            if (especieId.HasValue)
                query = query.Where(a => a.EspecieId == especieId.Value);

            if (localizacaoId.HasValue)
            {
                query = query.Where(a => 
                    (a.AnimalLocalizacao != null && a.AnimalLocalizacao.LocalizacaoId == localizacaoId.Value) ||
                    (a.AnimalLocalizacao == null && a.InstalacaoBioterioId == localizacaoId.Value));
            }

            if (genero.HasValue)
                query = query.Where(a => a.Genero == genero.Value);

            if (situacao.HasValue)
                query = query.Where(a => a.SituacaoAnimal == situacao.Value);

            if (sisfauna.HasValue)
                query = query.Where(a => a.Sisfauna == sisfauna.Value);

            if (faseDeVida != null && faseDeVida.Count > 0)
            {
                var fases = faseDeVida.Select(f => (FaseDeVida)f).ToList();
                query = query.Where(a => fases.Contains(a.FaseDeVida));
            }

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.ToLower();
                query = query.Where(a =>
                    a.NumeroRegistro.ToLower().Contains(term) ||
                    a.NomePopular.ToLower().Contains(term) ||
                    (a.Especie != null && a.Especie.Nome.ToLower().Contains(term)) ||
                    (a.LocalOrigem != null && a.LocalOrigem.Nome.ToLower().Contains(term)) ||
                    (a.AnimalLocalizacao != null && a.AnimalLocalizacao.Localizacao != null && a.AnimalLocalizacao.Localizacao.Nome.ToLower().Contains(term)) ||
                    (a.InstalacaoBioterio != null && a.InstalacaoBioterio.Nome.ToLower().Contains(term)) ||
                    a.NumeroChip.ToLower().Contains(term));
            }

            return query;
        }

        public async Task<int> GetAnimalsCountAsync(
            int? especieId = null,
            int? localizacaoId = null,
            Genero? genero = null,
            Situacao? situacao = null,
            bool? sisfauna = null,
            string? searchTerm = null,
            List<int>? faseDeVida = null)
        {
            var query = BuildFilterQuery(especieId, localizacaoId, genero, situacao, sisfauna, searchTerm, faseDeVida);
            return await query.CountAsync();
        }

        public async Task<List<Animal>> GetAnimalsListAsync(
            int? especieId = null,
            int? localizacaoId = null,
            Genero? genero = null,
            Situacao? situacao = null,
            bool? sisfauna = null,
            string? searchTerm = null,
            List<int>? faseDeVida = null,
            int page = 1,
            int pageSize = int.MaxValue)
        {
            var query = BuildFilterQuery(especieId, localizacaoId, genero, situacao, sisfauna, searchTerm, faseDeVida);

            var skip = (page - 1) * pageSize;

            return await query
                .OrderByDescending(a => a.Id)
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IReadOnlyList<(int Id, string NumeroRegistro, string EspecieNome, decimal? Peso)>> GetAnimalLookupAsync()
        {
            return await _context.Animals
                .AsNoTracking()
                .Include(a => a.Especie)
                .Include(a => a.BiometriaAnimais)
                .Where(a => a.SituacaoAnimal == Situacao.Vivo)
                .OrderBy(a => a.NumeroRegistro)
                .Select(a => new { 
                    a.Id, 
                    a.NumeroRegistro, 
                    EspecieNome = a.Especie != null ? a.Especie.Nome : "",
                    Peso = (decimal?)a.BiometriaAnimais.OrderByDescending(b => b.DataBiometria).FirstOrDefault().Peso
                })
                .ToListAsync()
                .ContinueWith(t => (IReadOnlyList<(int, string, string, decimal?)>)t.Result
                    .Select(x => (x.Id, x.NumeroRegistro, x.EspecieNome, x.Peso))
                    .ToList());
        }

        public async Task UpdateNomePopularByEspecieIdAsync(int especieId, string novoNomePopular)
        {
            await _context.Animals
                .Where(a => a.EspecieId == especieId)
                .ExecuteUpdateAsync(s => s.SetProperty(a => a.NomePopular, novoNomePopular));
        }

        public async Task<bool> IsAnimalVivoAsync(int animalId, CancellationToken cancellationToken = default)
        {
            var situacao = await _context.Animals
                .AsNoTracking()
                .Where(a => a.Id == animalId)
                .Select(a => (Situacao?)a.SituacaoAnimal)
                .FirstOrDefaultAsync(cancellationToken);

            return situacao == Situacao.Vivo;
        }

        public async Task<Situacao?> GetSituacaoAnimalAsync(int animalId, CancellationToken cancellationToken = default)
        {
            return await _context.Animals
                .AsNoTracking()
                .Where(a => a.Id == animalId)
                .Select(a => (Situacao?)a.SituacaoAnimal)
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}
