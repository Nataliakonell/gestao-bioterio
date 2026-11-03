using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IPerfilPermissaoRepository : IAsyncRepository<PerfilPermissao>
    {
        Task<bool> HasPermissionAsync(int perfilId, string funcionalidade, NivelAcesso? nivelMinimo = null);
        Task<List<PerfilPermissao>> GetPermissoesEntitiesByPerfilIdAsync(int perfilId);
        Task<List<(string Funcionalidade, string NivelAcesso)>> GetPermissoesByPerfilIdAsync(int perfilId);
        Task<PerfilPermissao?> GetPermissaoEspecificaAsync(int perfilId, int funcionalidadeId);
    }
}
