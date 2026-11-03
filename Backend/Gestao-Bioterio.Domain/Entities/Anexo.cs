using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class Anexo : AuditableEntity
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string? NomeArquivoAnexo { get; set; } = string.Empty;
        public string? Descricao{ get; set; }
        public string? Responsavel { get; set; }
    }
}
