using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class Evolucao : AuditableEntity
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string Descricao { get; set; }
        public DateTime DataHoraRegistro { get; set; }
        public string Responsavel { get; set; }
    }
}
