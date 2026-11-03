using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class PerfilRepository : BaseRepository<Perfil>, IPerfilRepository
    {
        public PerfilRepository(BioterioDbContext context) : base(context)
        {
        }
    }
}
