using Gestao_Bioterio.Application.Features.Consultas.Queries.GetVisaoGeralClinica;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IConsultaRepository : IAsyncRepository<Consulta>
    {
        Task<List<Consulta>> GetConsultasByAnimalAsync(int animalId);
        Task<int> GetConsultasCountAsync(string? searchTerm = null, int? animalId = null);
        Task<IReadOnlyList<Consulta>> GetConsultasPaginatedAsync(string? searchTerm = null, int page = 1, int pageSize = 10, int? animalId = null);
        Task<Consulta?> GetConsultaWithDetailsAsync(int id);
        Task<VisaoGeralClinicaResponse> GetVisaoGeralClinicaAsync(GetVisaoGeralClinicaQuery query, CancellationToken cancellationToken = default);
    }
}
