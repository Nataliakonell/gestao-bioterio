using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class AnexoRepository : BaseRepository<Anexo>, IAnexoRepository
    {
        public AnexoRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<List<Anexo>> GetAnexosByAnimalAsync(int animalId)
        {
            return await _context.Anexos
                .AsNoTracking()
                .Where(a => a.AnimalId == animalId)
                .OrderByDescending(a => a.Id)
                .ToListAsync();
        }
    }
}