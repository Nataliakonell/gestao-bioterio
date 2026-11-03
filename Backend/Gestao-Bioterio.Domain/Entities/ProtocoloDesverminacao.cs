using Gestao_Bioterio.Domain.Common;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Domain.Entities
{
    public class ProtocoloDesverminacao : AuditableEntity
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public Animal? Animal { get; set; }
        public DateTime DataEntrada { get; set; }
        public StatusProtocolo StatusProtocolo { get; set; }
        public bool CicloInicialConcluido { get; set; }
        public DateTime? DataConclusaoCicloInicial { get; set; }
        public DateTime? DataProximaDose { get; set; }
        public ICollection<DoseAplicacaoDesverminacao> Doses { get; set; } = new List<DoseAplicacaoDesverminacao>();
    }
    public enum StatusProtocolo
    {
        AguardandoPrimeiraDose = 1,
        AguardandoSegundaDose = 2,
        ManutencaoAnual = 3,
        Atrasado = 4,
        Concluido = 5,
        Suspenso = 6
    }
}
