namespace Gestao_Bioterio.Domain.Common
{
    public class AuditableEntity
    {
        public string RF { get; set; } = string.Empty;
        public DateTime DataCriacao { get; set; }
    }

    public class LogAuditableEntity : AuditableEntity
    {
        public DateTime DataAtualizacao { get; set; }
        public string TipoOperacao { get; set; } = string.Empty;
    }
}
