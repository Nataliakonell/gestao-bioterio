using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class PerfilPermissaoRepository : BaseRepository<PerfilPermissao>, IPerfilPermissaoRepository
    {
        public PerfilPermissaoRepository(BioterioDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<bool> HasPermissionAsync(int perfilId, string funcionalidade, NivelAcesso? nivelMinimo = null)
        {
            var query =
            from permissao in _context.PerfilPermissoes.AsNoTracking() join func in _context.Funcionalidades.AsNoTracking() 
            on permissao.FuncionalidadeId equals func.Id
            where permissao.PerfilId == perfilId
            && func.Nome == funcionalidade
            select permissao;

            if (nivelMinimo.HasValue)
            {
                query = query.Where(p => p.NivelAcesso >= nivelMinimo.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<List<PerfilPermissao>> GetPermissoesEntitiesByPerfilIdAsync(int perfilId)
        {
            return await _context.PerfilPermissoes
                .Where(p => p.PerfilId == perfilId)
                .ToListAsync();
        }

        public async Task<List<(string Funcionalidade, string NivelAcesso)>> GetPermissoesByPerfilIdAsync(int perfilId)
        {
            var query =
                from permissao in _context.PerfilPermissoes.AsNoTracking()
                join func in _context.Funcionalidades.AsNoTracking() on permissao.FuncionalidadeId equals func.Id
                where permissao.PerfilId == perfilId
                select new { func.Nome, permissao.NivelAcesso };

            var results = await query.ToListAsync();
            return results.Select(r => (r.Nome, r.NivelAcesso.ToString())).ToList();
        }
        
        public async Task<PerfilPermissao?> GetPermissaoEspecificaAsync(int perfilId, int funcionalidadeId)
        {
            return await _context.PerfilPermissoes
                .FirstOrDefaultAsync(p => p.PerfilId == perfilId && p.FuncionalidadeId == funcionalidadeId);
        }
    }
}
