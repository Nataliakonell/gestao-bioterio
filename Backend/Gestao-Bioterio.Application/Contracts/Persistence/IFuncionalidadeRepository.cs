using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Contracts.Persistence
{
    public interface IFuncionalidadeRepository : IAsyncRepository<Funcionalidade>
    {
    }
}
