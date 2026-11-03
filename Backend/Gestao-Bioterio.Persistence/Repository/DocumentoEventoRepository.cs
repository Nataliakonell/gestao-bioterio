using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class DocumentoEventoRepository : BaseRepository<DocumentoEvento>, IDocumentoEventoRepository
    {
        public DocumentoEventoRepository(BioterioDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<DocumentoEvento?> ObterPorEventoIdAsync(int eventoId)
        {
            return await _context.DocumentosEventos
                .FirstOrDefaultAsync(x => x.EventoId == eventoId);
        }
    }
}
