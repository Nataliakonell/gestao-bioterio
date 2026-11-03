using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IRotinaAnimalLogRepository : IAsyncRepository<RotinaAnimalLog>
    {
        Task<List<RotinaAnimalLog>> GetHistoricoRotinaAnimalAsync(int rotinaAnimalId);
        Task<RotinaAnimalLog?> GetVersaoEspecificaAsync(int rotinaAnimalId, int versao);
        Task<List<RotinaAnimalLog>> GetHistoricoPorPeriodoAsync(int rotinaAnimalId, DateTime dataInicio, DateTime dataFim);
        Task<List<RotinaAnimalLog>> GetHistoricoPorusuarioAsync(int rotinaAnimalId, string rf);
        Task<RotinaAnimalLog?> GetPrimeiraVersaoAsync(int rotinaAnimalId);
        Task<List<RotinaAnimalLog>> GetApenasAtualizacoesAsync(int rotinaAnimalId);
    }
}
