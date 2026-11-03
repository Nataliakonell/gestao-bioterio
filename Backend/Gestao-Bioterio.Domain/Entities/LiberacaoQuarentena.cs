using Gestao_Bioterio.Domain.Common;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Domain.Entities
{
    public class LiberacaoQuarentena : AuditableEntity
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public Animal? Animal { get; set; }
        public DateTime DataEntradaQuarentena { get; set; }
        public DateTime DataSaidaQuarentena { get; set; }
        public int? InstalacaoBioterioId { get; set; }
        public InstalacaoBioterio? InstalacaoBioterio { get; set; }
        public string? Responsavel { get; set; }
    }
}
