using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class RegistroObito : AuditableEntity
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public Animal? Animal { get; set; }
        public DateTime DataObito { get; set; }
        public bool HouveNecropsia { get; set; }
        public string? Observacoes { get; set; }
    }
}
