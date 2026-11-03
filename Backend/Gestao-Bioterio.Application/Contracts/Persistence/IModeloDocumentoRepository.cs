using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IModeloDocumentoRepository : IAsyncRepository<ModeloDocumento>
    {
        Task<ModeloDocumento?> GetByTipoDocumentoAsync(TipoDocumento tipoDocumento);
        Task<ModeloDocumento?> GetByIdWithIncludesAsync(int id);
        Task<List<ModeloDocumento>> GetAllWithIncludesAsync(TipoSecaoTemplate? tipoSecao = null);
    }
}
