using Gestao_Bioterio.Domain.Common;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Domain.Entities
{
    public class PrescricaoMedicacao : AuditableEntity
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public Animal? Animal { get; set; }
        public int MedicacaoId { get; set; }
        public Medicacao? Medicacao { get; set; }
        public string VolumeDose { get; set; } = string.Empty;
        public ViaAdministracao ViaAdministracao { get; set; }
        public int QuantidadeDoses { get; set; }
        public int IntervaloEntreDosesHoras { get; set; }
        public DateTime DataHoraInicio { get; set; }
        public string Observacao { get; set; } = string.Empty;
        public StatusPrescricao StatusPrescricao { get; set; } = StatusPrescricao.Ativa;
        public DateTime? DataHoraSuspensao { get; set; }
        public string? MotivoSuspensao { get; set; }
        public List<MedicacaoAdministrada> Administracoes { get; set; } = new();
        public string? Responsavel { get; set; }
    }
    public enum ViaAdministracao
    {
        Subcutanea = 1,
        Intramuscular = 2,
        Endovenosa = 3,
        Intradermica = 4,
        Intracelomatica = 5,
        Topica = 6,
        Oral = 7,
        Ocular = 8
    }

    public enum StatusPrescricao
    {
        Ativa = 1,
        Concluida = 2,
        Suspensa = 3
    }
}
