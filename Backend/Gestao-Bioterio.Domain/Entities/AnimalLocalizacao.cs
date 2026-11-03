using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class AnimalLocalizacao : LogAuditableEntity
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public Animal Animal { get; set; } = null!;
        public int LocalizacaoId { get; set; }
        public Localizacao Localizacao { get; set; } = null!;
    }
}
