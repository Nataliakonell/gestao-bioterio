using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class MedicacaoRepository : BaseRepository<Medicacao>, IMedicacaoRepository
    {
        public MedicacaoRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<List<Medicacao>> GetMedicacoesAtivasAsync()
        {
            return await _context.Medicacoes
                .AsNoTracking()
                .Where(m => m.Ativo)
                .OrderBy(m => m.PrincipioAtivo)
                .ThenBy(m => m.NomeComercial)
                .ToListAsync();
        }

        public async Task<IReadOnlyList<(int Id, string PrincipioAtivo, string NomeComercial)>> GetMedicacaoLookupAsync()
        {
            var result = await _context.Medicacoes
                .AsNoTracking()
                .Where(m => m.Ativo)
                .OrderBy(m => m.PrincipioAtivo)
                .ThenBy(m => m.NomeComercial)
                .Select(m => new { m.Id, m.PrincipioAtivo, m.NomeComercial })
                .ToListAsync();
            
            return result.Select(m => (m.Id, m.PrincipioAtivo, m.NomeComercial)).ToList();
        }

        public async Task<bool> IsUniqueAsync(string principioAtivo, string nomeComercial, int? idToIgnore = null)
        {
            return !await _context.Medicacoes
                .AnyAsync(m => m.PrincipioAtivo.ToLower().Trim() == principioAtivo.ToLower().Trim()
                            && m.NomeComercial.ToLower().Trim() == nomeComercial.ToLower().Trim()
                            && (!idToIgnore.HasValue || m.Id != idToIgnore.Value));
        }
    }
}