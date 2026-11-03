using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class DoseAplicacaoDesverminacaoRepository : BaseRepository<DoseAplicacaoDesverminacao>, IDoseAplicacaoDesverminacaoRepository
    {
        public DoseAplicacaoDesverminacaoRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<List<DoseAplicacaoDesverminacao>> GetDosesByProtocoloAsync(int protocoloId)
        {
            return await _context.DosesAplicacaoDesverminacao
                .AsNoTracking()
                .Where(d => d.ProtocoloDesverminacaoId == protocoloId)
                .OrderBy(d => d.DataPrevista)
                .ToListAsync();
        }

        public async Task<List<DoseAplicacaoDesverminacao>> GetDosesByAnimalAsync(int animalId)
        {
            return await _context.DosesAplicacaoDesverminacao
                .Include(d => d.ProtocoloDesverminacao)
                .AsNoTracking()
                .Where(d => d.ProtocoloDesverminacao.AnimalId == animalId)
                .OrderBy(d => d.DataPrevista)
                .ToListAsync();
        }

        public async Task<List<DoseAplicacaoDesverminacao>> GetDosesPendentesAsync(DateTime data)
        {
            return await _context.DosesAplicacaoDesverminacao
                .Include(d => d.ProtocoloDesverminacao)
                    .ThenInclude(p => p.Animal)
                .AsNoTracking()
                .Where(d => d.DataAplicacao == null && d.DataPrevista.Date == data.Date)
                .OrderBy(d => d.DataPrevista)
                .ToListAsync();
        }
    }
}