using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class TipoProcedimentoRepository(BioterioDbContext context) : BaseRepository<TipoProcedimento>(context), ITipoProcedimentoRepository
    {
    }
}
