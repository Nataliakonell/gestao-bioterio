using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class ProtocoloDesverminacaoRepository : BaseRepository<ProtocoloDesverminacao>, IProtocoloDesverminacaoRepository
    {
        public ProtocoloDesverminacaoRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<ProtocoloDesverminacao?> GetProtocoloByAnimalAsync(int animalId)
        {
            return await _context.ProtocolosDesverminacao
                .AsNoTracking()
                .OrderByDescending(p => p.Id)
                .FirstOrDefaultAsync(p => p.AnimalId == animalId);
        }

        public async Task<List<ProtocoloDesverminacao>> GetProtocolosAsync()
        {
            return await _context.ProtocolosDesverminacao
                .Include(p => p.Animal)
                    .ThenInclude(a => a.Especie)
                .Include(p => p.Doses)
                .AsNoTracking()
                .OrderBy(p => p.DataEntrada)
                .ToListAsync();
        }

        public async Task<ProtocoloDesverminacao?> GetProtocoloWithDosesAsync(int id)
        {
            return await _context.ProtocolosDesverminacao
                .Include(p => p.Animal)
                    .ThenInclude(a => a.Especie)
                .Include(p => p.Doses)
                    .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<List<ProtocoloDesverminacao>> GetProtocolosComDosePendenteAsync(DateTime data)
        {
            return await _context.ProtocolosDesverminacao
                .Include(p => p.Animal)
                    .ThenInclude(a => a.Especie)
                .Include(p => p.Doses)
                .AsNoTracking()
                .Where(p => p.Doses.Any(d => d.DataPrevista.Date == data.Date && d.DataAplicacao == null))
                .ToListAsync();
        }

        public async Task<List<ProtocoloDesverminacao>> GetProtocolosAtrasadosAsync()
        {
            var hoje = DateTime.Today;
            return await _context.ProtocolosDesverminacao
                .Include(p => p.Animal)
                    .ThenInclude(a => a.Especie)
                .Include(p => p.Doses)
                .AsNoTracking()
                .Where(p => p.Doses.Any(d => d.DataPrevista.Date < hoje && d.DataAplicacao == null))
                .ToListAsync();
        }
    }
}