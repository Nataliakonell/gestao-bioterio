using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class SolicitacaoExame  : AuditableEntity
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public TipoExame TipoExame { get; set; }
        public string? SinaisClinicos { get; set; }
        public string? SuspeitaClinica { get; set; }
        public string RegiaoAnatomica{ get; set; }
        public string Observacao { get; set; } = string.Empty;
        public StatusSolicitacaoExame Status { get; set; } = StatusSolicitacaoExame.Ativa;
        public DateTime? DataSuspensao { get; set; }
        public string? MotivoSuspensao { get; set; }
        public string? Responsavel { get; set; }
    }
    public enum TipoExame
    {
        HemogramaCompleto=1,
        Ultrassonografia=2,
        Radiografia=3,
        Outros=4
    }
    public enum StatusSolicitacaoExame
    {
        Ativa = 1,
        Suspensa = 2,
        Cancelada = 3
    }
}
