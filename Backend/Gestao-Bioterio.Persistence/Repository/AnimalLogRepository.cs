using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class AnimalLogRepository : BaseRepository<AnimalLog>, IAnimalLogRepository
    {
        public AnimalLogRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<List<AnimalLog>> GetHistoricoAnimalAsync(int animalId)
        {
            return await _context.AnimaisLog
                .Where(l => l.AnimalId == animalId)
                .OrderBy(l => l.DataCriacao)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<AnimalLog?> GetVersaoEspecificaAsync(int animalId, int versao)
        {
            var logs = await _context.AnimaisLog
                .Where(l => l.AnimalId == animalId)
                .OrderBy(l => l.DataCriacao)
                .AsNoTracking()
                .ToListAsync();

            if (versao > 0 && versao <= logs.Count)
            {
                return logs[versao - 1];
            }

            return null;
        }
        public async Task<List<AnimalLog>> GetHistoricoPorPeriodoAsync(int animalId, DateTime dataInicio, DateTime dataFim)
        {
            return await _context.AnimaisLog
                .Where(l => l.AnimalId == animalId && 
                           l.DataCriacao >= dataInicio && 
                           l.DataCriacao <= dataFim)
                .OrderBy(l => l.DataCriacao)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<List<AnimalLog>> GetHistoricoPorusuarioAsync(int animalId, string rf)
        {
            return await _context.AnimaisLog
                .Where(l => l.AnimalId == animalId && l.RF == rf)
                .OrderBy(l => l.DataCriacao)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<AnimalLog?> GetPrimeiraVersaoAsync(int animalId)
        {
            return await _context.AnimaisLog
                .Where(l => l.AnimalId == animalId && l.TipoOperacao == "CREATE")
                .FirstOrDefaultAsync();
        }
        public async Task<List<AnimalLog>> GetApenasAtualizacoesAsync(int animalId)
        {
            return await _context.AnimaisLog
                .Where(l => l.AnimalId == animalId && l.TipoOperacao == "UPDATE")
                .OrderBy(l => l.DataCriacao)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
