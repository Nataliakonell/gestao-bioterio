using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class FuncionalidadeRepository : BaseRepository<Funcionalidade>, IFuncionalidadeRepository
    {
        public FuncionalidadeRepository(BioterioDbContext context) : base(context)
        {
        }
    }
}
