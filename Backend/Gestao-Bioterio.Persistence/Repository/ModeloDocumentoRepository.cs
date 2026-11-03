using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class ModeloDocumentoRepository : BaseRepository<ModeloDocumento>, IModeloDocumentoRepository
    {
        public ModeloDocumentoRepository(BioterioDbContext context) : base(context)
        {
        }

        public async Task<ModeloDocumento?> GetByTipoDocumentoAsync(TipoDocumento tipoDocumento)
        {
            return await _context.ModelosDocumentos
                .AsNoTracking()
                .Include(m => m.HeaderTemplate)
                .Include(m => m.FooterTemplate)
                .Where(m => m.TipoSecao == TipoSecaoTemplate.Body && m.TipoDocumento == tipoDocumento && m.Ativo)
                .OrderByDescending(m => m.DataCriacao)
                .FirstOrDefaultAsync();
        }

        public async Task<ModeloDocumento?> GetByIdWithIncludesAsync(int id)
        {
            return await _context.ModelosDocumentos
                .AsNoTracking()
                .Include(m => m.HeaderTemplate)
                .Include(m => m.FooterTemplate)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<List<ModeloDocumento>> GetAllWithIncludesAsync(TipoSecaoTemplate? tipoSecao = null)
        {
            var query = _context.ModelosDocumentos
                .AsNoTracking()
                .Include(m => m.HeaderTemplate)
                .Include(m => m.FooterTemplate)
                .AsQueryable();

            if (tipoSecao.HasValue)
            {
                query = query.Where(m => m.TipoSecao == tipoSecao.Value);
            }

            return await query.OrderByDescending(m => m.DataCriacao).ToListAsync();
        }
    }
}
