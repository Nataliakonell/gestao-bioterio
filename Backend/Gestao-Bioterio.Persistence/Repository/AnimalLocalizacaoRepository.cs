using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class AnimalLocalizacaoRepository : BaseRepository<AnimalLocalizacao>, IAnimalLocalizacaoRepository
    {
        public AnimalLocalizacaoRepository(BioterioDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<AnimalLocalizacao?> ObterPorAnimalIdAsync(int animalId)
        {
            return await _context.AnimalLocalizacoes
                .Include(x => x.Localizacao)
                .FirstOrDefaultAsync(x => x.AnimalId == animalId);
        }
    }
}
