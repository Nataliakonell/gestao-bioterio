using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class PerfilPermissaoLog : LogAuditableEntity
    {
        public int Id { get; set; }
        public int PerfilId { get; set; }
        public int FuncionalidadeId { get; set; }
        public NivelAcesso NivelAcesso { get; set; }
    }
}
