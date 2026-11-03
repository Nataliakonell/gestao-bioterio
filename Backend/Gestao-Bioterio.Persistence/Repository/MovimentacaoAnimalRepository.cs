using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class MovimentacaoAnimalRepository : BaseRepository<MovimentacaoAnimal>, IMovimentacaoAnimalRepository
    {
        public MovimentacaoAnimalRepository(BioterioDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<List<MovimentacaoAnimal>> ObterHistoricoPorAnimalIdAsync(int animalId)
        {
            return await _context.MovimentacoesAnimais
                .AsNoTracking()
                .Where(x => x.AnimalId == animalId)
                .OrderByDescending(x => x.DataCriacao)
                .ToListAsync();
        }
    }
}
