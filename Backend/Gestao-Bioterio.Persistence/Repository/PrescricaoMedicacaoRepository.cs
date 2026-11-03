using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class PrescricaoMedicacaoRepository : BaseRepository<PrescricaoMedicacao>, IPrescricaoMedicacaoRepository
    {
        public PrescricaoMedicacaoRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<List<PrescricaoMedicacao>> GetPrescricoesByAnimalAsync(int animalId)
        {
            return await _context.PrescricoesMedicacao
                .Include(p => p.Medicacao)
                .Include(p => p.Administracoes)
                .AsNoTracking()
                .Where(p => p.AnimalId == animalId)
                .OrderByDescending(p => p.DataHoraInicio)
                .ToListAsync();
        }

        public async Task<PrescricaoMedicacao?> GetPrescricaoWithDetailsAsync(int id)
        {
            return await _context.PrescricoesMedicacao
                .Include(p => p.Medicacao)
                .Include(p => p.Administracoes)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<List<PrescricaoMedicacao>> GetAllPrescricoesWithDetailsAsync()
        {
            return await _context.PrescricoesMedicacao
                .Include(p => p.Medicacao)
                .Include(p => p.Administracoes)
                .AsNoTracking()
                .OrderByDescending(p => p.DataHoraInicio)
                .ToListAsync();
        }
    }
}