using Gestao_Bioterio.Domain.Common;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Domain.Entities
{
    public class Consulta : AuditableEntity
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public Animal? Animal { get; set; }
        public string? Anamnese { get; set; }
        public string? ExameFisico { get; set; }
        public string? SuspeitaDiagnostica { get; set; }
        public int? InstalacaoBioterioId { get; set; }
        public InstalacaoBioterio? InstalacaoBioterio { get; set; }
        public DateTime DataHoraConsulta { get; set; } = DateTime.Now;
        public string? Responsavel { get; set; }
    }
}
