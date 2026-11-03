using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class Evento : AuditableEntity
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public TipoEvento TipoEvento { get; set; }
        public DateTime DataHoraInicio { get; set; }
        public DateTime DataHoraPrevisaoRetorno { get; set; }
        public string Responsavel { get; set; } = string.Empty;
        public Status Status { get; set; }
    }

    public enum TipoEvento
    {
        Interno = 1,
        Externo = 2
    }

    public enum Status
    {
        Agendado = 1,
        EmAndamento = 2,
        Cancelado = 3,
        Concluido = 4,
        RegistroRetornoAtrasado = 5
    }
}
