using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class DocumentoEvento : AuditableEntity
    {
        public int Id { get; set; }
        public int EventoId { get; set; }
        public int ModeloDocumentoId { get; set; }
        public string ConteudoDadosJson { get; set; }
    }
}
