using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class LocalizacaoRepository : BaseRepository<Localizacao>, ILocalizacaoRepository
    {
        public LocalizacaoRepository(BioterioDbContext dbContext) : base(dbContext)
        {
        }
    }
}
