using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class TipoProcedimento : AuditableEntity
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public bool Ativo { get; set; } = true;
    }
}
