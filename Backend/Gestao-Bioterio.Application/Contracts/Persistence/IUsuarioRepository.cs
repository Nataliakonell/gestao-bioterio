using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Application.Contracts.Persistence.DTOs;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IUsuarioRepository : IAsyncRepository<Usuario>
    {
        Task<Usuario?> GetByRfAsync(string rf);
        Task<UsuarioExternoDto?> BuscarDadosExternosPorRfAsync(string rf);
        Task<bool> IsRfUniqueAsync(string rf, int? ignoreId = null);
        Task<bool> IsEmailUniqueAsync(string email, int? ignoreId = null);
        Task<IReadOnlyList<Usuario>> GetUsuarioListAsync(string? searchTerm = null, bool? status = null, int page = 1, int pageSize = 10);
        Task<int> GetUsuarioCountAsync(string? searchTerm = null, bool? status = null);
        Task<IReadOnlyList<(int Id, string Nome, string RF)>> GetUsuarioLookupAsync();
    }
}
