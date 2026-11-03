using Gestao_Bioterio.Domain.Common;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Domain.Entities
{
    public class DoseAplicacaoDesverminacao : AuditableEntity
    {
        public int Id { get; set; }
        public int ProtocoloDesverminacaoId { get; set; }
        public ProtocoloDesverminacao ProtocoloDesverminacao { get; set; }
        public TipoDose TipoDose { get; set; }
        public DateTime DataPrevista { get; set; }
        public DateTime? DataAplicacao { get; set; } 
        public StatusDoseDesverminacao StatusDoseDesverminacao { get; set; }
        public string? Observacao { get; set; }
        public string? Responsavel { get; set; }
    }
    public enum StatusDoseDesverminacao
    {
        Agendada = 1,
        Hoje = 2,
        Atrasada = 3,
        Aplicada = 4
    }
    public enum TipoDose
    {
        PrimeiraDose = 1,
        SegundaDose = 2,
        Anual = 3
    }
}
