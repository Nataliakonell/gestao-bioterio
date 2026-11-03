using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class MedicacaoAdministrada  : AuditableEntity
    {
        public int Id { get; set; }
        public int PrescricaoMedicacaoId { get; set; }
        public PrescricaoMedicacao? PrescricaoMedicacao { get; set; }
        public DateTime? DataHoraAdministracao { get; set; }
        public DateTime DataHoraPrevista { get; set; }
        public string Observacao { get; set; }
        public string Responsavel { get; set; }
        public StatusDose StatusDose{ get; set; }
    }
    public enum StatusDose
    {
        Agendada=1,
        Atrasada=2,
        Concluido=3
    }
}
