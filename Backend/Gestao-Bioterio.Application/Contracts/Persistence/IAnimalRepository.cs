using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IAnimalRepository : IAsyncRepository<Animal>
    {
        Task<List<Animal>> GetAnimalsListAsync(
            int? especieId = null,
            int? localizacaoId = null,
            Genero? genero = null,
            Situacao? situacao = null,
            bool? sisfauna = null,
            string? searchTerm = null,
            List<int>? faseDeVida = null,
            int page = 1,
            int pageSize = int.MaxValue);

        Task<int> GetAnimalsCountAsync(
            int? especieId = null,
            int? localizacaoId = null,
            Genero? genero = null,
            Situacao? situacao = null,
            bool? sisfauna = null,
            string? searchTerm = null,
            List<int>? faseDeVida = null);

        Task<bool> NumeroRegistroIsUnique(string numeroRegistro);
        Task<bool> NumeroChipIsUnique(string numeroChip);
        Task<Animal?> GetAnimalWithDetailsAsync(int id);
        Task UpdateNomePopularByEspecieIdAsync(int especieId, string novoNomePopular);
        Task<IReadOnlyList<(int Id, string NumeroRegistro, string EspecieNome, decimal? Peso)>> GetAnimalLookupAsync();
        Task<bool> IsAnimalVivoAsync(int animalId, CancellationToken cancellationToken = default);
        Task<Situacao?> GetSituacaoAnimalAsync(int animalId, CancellationToken cancellationToken = default);
    }
}
