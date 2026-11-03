using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class MedicacaoAdministradaRepository : BaseRepository<MedicacaoAdministrada>, IMedicacaoAdministradaRepository
    {
        public MedicacaoAdministradaRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<List<MedicacaoAdministrada>> GetAdministracoesByPrescricaoAsync(int prescricaoId)
        {
            return await _context.MedicacoesAdministradas
                .AsNoTracking()
                .Where(a => a.PrescricaoMedicacaoId == prescricaoId)
                .OrderBy(a => a.DataHoraPrevista)
                .ToListAsync();
        }

        public async Task<List<MedicacaoAdministrada>> GetAdministracoesByAnimalAsync(int animalId)
        {
            return await _context.MedicacoesAdministradas
                .Include(a => a.PrescricaoMedicacao)
                    .ThenInclude(p => p.Medicacao)
                .AsNoTracking()
                .Where(a => a.PrescricaoMedicacao.AnimalId == animalId)
                .OrderBy(a => a.DataHoraPrevista)
                .ToListAsync();
        }

        public async Task<List<MedicacaoAdministrada>> GetAdministracoesPendentesAsync(DateTime? data = null)
        {
            var query = _context.MedicacoesAdministradas
                .Include(a => a.PrescricaoMedicacao)
                    .ThenInclude(p => p.Medicacao)
                .AsNoTracking()
                .Where(a => a.DataHoraAdministracao == null)
                .AsQueryable();

            if (data.HasValue)
                query = query.Where(a => a.DataHoraPrevista.Date == data.Value.Date);

            return await query
                .OrderBy(a => a.DataHoraPrevista)
                .ToListAsync();
        }

        public async Task<List<MedicacaoAdministrada>> GetAllWithIncludesAsync()
        {
            return await _context.MedicacoesAdministradas
                .Include(a => a.PrescricaoMedicacao)
                    .ThenInclude(p => p.Medicacao)
                .AsNoTracking()
                .OrderBy(a => a.DataHoraPrevista)
                .ToListAsync();
        }
    }
}