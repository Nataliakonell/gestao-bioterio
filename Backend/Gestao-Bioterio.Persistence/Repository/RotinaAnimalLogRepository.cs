using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace Gestao_Bioterio.Persistence.Repository
{
    public class RotinaAnimalLogRepository : BaseRepository<RotinaAnimalLog>, IRotinaAnimalLogRepository
    {
        public RotinaAnimalLogRepository(BioterioDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<List<RotinaAnimalLog>> GetHistoricoRotinaAnimalAsync(int rotinaAnimalId)
        {
            return await _context.RotinasAnimaisLogs
                .Where(l => l.RotinaAnimalId == rotinaAnimalId)
                .OrderBy(l => l.DataCriacao)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<RotinaAnimalLog?> GetVersaoEspecificaAsync(int rotinaAnimalId, int versao)
        {
            var logs = await _context.RotinasAnimaisLogs
                .Where(l => l.RotinaAnimalId == rotinaAnimalId)
                .OrderBy(l => l.DataCriacao)
                .AsNoTracking()
                .ToListAsync();

            if (versao > 0 && versao <= logs.Count)
            {
                return logs[versao - 1];
            }

            return null;
        }

        public async Task<List<RotinaAnimalLog>> GetHistoricoPorPeriodoAsync(int rotinaAnimalId, DateTime dataInicio, DateTime dataFim)
        {
            return await _context.RotinasAnimaisLogs
                .Where(l => l.RotinaAnimalId == rotinaAnimalId && 
                           l.DataCriacao >= dataInicio && 
                           l.DataCriacao <= dataFim)
                .OrderBy(l => l.DataCriacao)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<List<RotinaAnimalLog>> GetHistoricoPorusuarioAsync(int rotinaAnimalId, string rf)
        {
            return await _context.RotinasAnimaisLogs
                .Where(l => l.RotinaAnimalId == rotinaAnimalId && l.RF == rf)
                .OrderBy(l => l.DataCriacao)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<RotinaAnimalLog?> GetPrimeiraVersaoAsync(int rotinaAnimalId)
        {
            return await _context.RotinasAnimaisLogs
                .Where(l => l.RotinaAnimalId == rotinaAnimalId && l.TipoOperacao == "CREATE")
                .FirstOrDefaultAsync();
        }

        public async Task<List<RotinaAnimalLog>> GetApenasAtualizacoesAsync(int rotinaAnimalId)
        {
            return await _context.RotinasAnimaisLogs
                .Where(l => l.RotinaAnimalId == rotinaAnimalId && l.TipoOperacao == "UPDATE")
                .OrderBy(l => l.DataCriacao)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
