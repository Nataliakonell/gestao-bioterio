using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class RefeicaoRepository : BaseRepository<Refeicao>, IRefeicaoRepository
    {
        public RefeicaoRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<List<Refeicao>> GetRefeicaoAsync(int? alimentacaoId = null)
        {
            var query = _context.Refeicoes
                .AsNoTracking()
                .AsQueryable();

            if (alimentacaoId.HasValue)
            {
                query = query.Where(r => r.AlimentacaoId == alimentacaoId.Value);
            }

            return await query
                .OrderBy(r => r.Id)
                .ToListAsync();
        }

        public async Task<Refeicao?> GetRefeicaoWithDetailsAsync(int id)
        {
            return await _context.Refeicoes
                .FirstOrDefaultAsync(r => r.Id == id);
        }
    }
}
