using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Contracts.Persistence.DTOs;
using Gestao_Bioterio.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Dapper;
using System.Data;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class UsuarioRepository(BioterioDbContext context, IDbConnection connection) : BaseRepository<Usuario>(context), IUsuarioRepository
    {

        public async Task<Usuario?> GetByRfAsync(string rf)
        {
            var normalizedRf = rf;
            if (rf.StartsWith("ra", StringComparison.OrdinalIgnoreCase))
            {
                normalizedRf = rf.Substring(2);
            }

            return await _context.Usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.RF == rf || u.RF == normalizedRf);
        }

        public virtual async Task<UsuarioExternoDto?> BuscarDadosExternosPorRfAsync(string rf)
        {
            var normalizedRf = rf;
            if (rf.StartsWith("ra", StringComparison.OrdinalIgnoreCase))
            {
                normalizedRf = rf.Substring(2);
            }

            var sql = @"
                SELECT fnc.NM_FNC COLLATE database_default AS Nome, CONCAT(fnc.NR_FNC, '@ucdb.br') COLLATE database_default AS Email 
                FROM dbsii.sii.T_FNC fnc WHERE NR_FNC = @RF
                UNION ALL
                SELECT acd.NM_ACD COLLATE database_default AS Nome, CONCAT('ra', acd.NR_ACD, '@ucdb.br') COLLATE database_default AS Email 
                FROM dbsii.sii.T_ACD acd WHERE NR_ACD = @RF";
                        
            return await connection.QueryFirstOrDefaultAsync<UsuarioExternoDto>(sql, new { RF = normalizedRf });
        }

        public async Task<bool> IsRfUniqueAsync(string rf, int? ignoreId = null)
        {
            var query = _context.Usuarios.AsNoTracking().Where(u => u.RF == rf);
            if (ignoreId.HasValue)
            {
                query = query.Where(u => u.Id != ignoreId.Value);
            }
            return !await query.AnyAsync();
        }

        public async Task<bool> IsEmailUniqueAsync(string email, int? ignoreId = null)
        {
            var query = _context.Usuarios.AsNoTracking().Where(u => u.Email.ToLower() == email.ToLower());
            if (ignoreId.HasValue)
            {
                query = query.Where(u => u.Id != ignoreId.Value);
            }
            return !await query.AnyAsync();
        }

        public async Task<IReadOnlyList<Usuario>> GetUsuarioListAsync(string? searchTerm = null, bool? status = null, int page = 1, int pageSize = 10)
        {
            var query = _context.Usuarios.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim().ToLower();
                query = query.Where(u => u.Nome.ToLower().Contains(term) || u.Email.ToLower().Contains(term) || u.RF.ToLower().Contains(term));
            }

            if (status.HasValue)
            {
                query = query.Where(u => u.Status == status.Value);
            }

            return await query
                .OrderBy(u => u.Nome)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetUsuarioCountAsync(string? searchTerm = null, bool? status = null)
        {
            var query = _context.Usuarios.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim().ToLower();
                query = query.Where(u => u.Nome.ToLower().Contains(term) || u.Email.ToLower().Contains(term) || u.RF.ToLower().Contains(term));
            }

            if (status.HasValue)
            {
                query = query.Where(u => u.Status == status.Value);
            }

            return await query.CountAsync();
        }

        public async Task<IReadOnlyList<(int Id, string Nome, string RF)>> GetUsuarioLookupAsync()
        {
            var list = await _context.Usuarios
                .AsNoTracking()
                .Where(u => u.Status)
                .OrderBy(u => u.Nome)
                .Select(u => new { u.Id, u.Nome, u.RF })
                .ToListAsync();

            return list.Select(x => (x.Id, x.Nome, x.RF)).ToList();
        }
    }
}
