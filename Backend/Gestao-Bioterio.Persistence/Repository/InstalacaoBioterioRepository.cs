using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class InstalacaoBioterioRepository : BaseRepository<InstalacaoBioterio>, IInstalacaoBioterioRepository
    {
        public InstalacaoBioterioRepository(BioterioDbContext context) : base(context)
        {
        }
    }
}