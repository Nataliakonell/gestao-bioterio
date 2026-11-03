using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class LiberacaoQuarentenaRepository : BaseRepository<LiberacaoQuarentena>, ILiberacaoQuarentenaRepository
    {
        public LiberacaoQuarentenaRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<LiberacaoQuarentena?> GetByAnimalIdAsync(int animalId)
        {
            return await _context.LiberacoesQuarentena
                .AsNoTracking()
                .Include(x => x.Animal)
                .Include(x => x.InstalacaoBioterio)
                .Where(x => x.AnimalId == animalId)
                .OrderByDescending(x => x.DataSaidaQuarentena)
                .ThenByDescending(x => x.DataCriacao)
                .FirstOrDefaultAsync();
        }

        public async Task<List<LiberacaoQuarentena>> GetAllByAnimalIdAsync(int? animalId)
        {
            var query = _context.LiberacoesQuarentena
                .AsNoTracking()
                .Include(x => x.Animal)
                .Include(x => x.InstalacaoBioterio)
                .AsQueryable();

            if (animalId.HasValue && animalId.Value > 0)
            {
                query = query.Where(x => x.AnimalId == animalId.Value);
            }

            return await query
                .OrderByDescending(x => x.DataSaidaQuarentena)
                .ThenByDescending(x => x.DataCriacao)
                .ToListAsync();
        }
    }
}
