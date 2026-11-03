using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IDocumentoEventoRepository : IAsyncRepository<DocumentoEvento>
    {
        Task<DocumentoEvento?> ObterPorEventoIdAsync(int eventoId);
    }
}
