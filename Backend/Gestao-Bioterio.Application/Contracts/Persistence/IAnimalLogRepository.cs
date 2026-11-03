using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IAnimalLogRepository : IAsyncRepository<AnimalLog>
    {
        Task<List<AnimalLog>> GetHistoricoAnimalAsync(int animalId);
        Task<AnimalLog?> GetVersaoEspecificaAsync(int animalId, int versao);
        Task<List<AnimalLog>> GetHistoricoPorPeriodoAsync(int animalId, DateTime dataInicio, DateTime dataFim);
        Task<List<AnimalLog>> GetHistoricoPorusuarioAsync(int animalId, string rf);
        Task<AnimalLog?> GetPrimeiraVersaoAsync(int animalId);
        Task<List<AnimalLog>> GetApenasAtualizacoesAsync(int animalId);
    }
}
