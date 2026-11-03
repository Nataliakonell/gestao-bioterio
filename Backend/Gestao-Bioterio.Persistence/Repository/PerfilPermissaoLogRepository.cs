using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class PerfilPermissaoLogRepository : BaseRepository<PerfilPermissaoLog>, IPerfilPermissaoLogRepository
    {
        public PerfilPermissaoLogRepository(BioterioDbContext dbContext) : base(dbContext)
        {
        }
    }
}
