using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IEventoRepository : IAsyncRepository<Evento>
    {
    }
}
