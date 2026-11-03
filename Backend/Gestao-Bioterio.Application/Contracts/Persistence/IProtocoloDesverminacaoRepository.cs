using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IProtocoloDesverminacaoRepository : IAsyncRepository<ProtocoloDesverminacao>
    {
        Task<ProtocoloDesverminacao?> GetProtocoloByAnimalAsync(int animalId);
        Task<List<ProtocoloDesverminacao>> GetProtocolosAsync();
        Task<ProtocoloDesverminacao?> GetProtocoloWithDosesAsync(int id);
        Task<List<ProtocoloDesverminacao>> GetProtocolosComDosePendenteAsync(DateTime data);
        Task<List<ProtocoloDesverminacao>> GetProtocolosAtrasadosAsync();
    }
}
