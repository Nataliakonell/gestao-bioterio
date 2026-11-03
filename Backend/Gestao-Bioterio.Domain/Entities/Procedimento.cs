using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class Procedimento : AuditableEntity
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public int TipoProcedimentoId { get; set; }
        public virtual TipoProcedimento TipoProcedimento { get; set; }
        public string Descricao { get; set; }
        public string? Responsavel { get; set; }
    }
}
