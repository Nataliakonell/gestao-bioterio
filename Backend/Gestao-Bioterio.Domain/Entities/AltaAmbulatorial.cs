using Gestao_Bioterio.Domain.Common;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Domain.Entities
{
    public class AltaAmbulatorial : AuditableEntity
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public Animal? Animal { get; set; }
        public DateTime? DataEntradaAmbulatorio { get; set; }
        public DateTime DataAltaClinica { get; set; }
        public string? ProcedimentosMedicacoes { get; set; }
        public string? ObservacoesClinicas { get; set; }
        public int? InstalacaoBioterioRetornoId { get; set; }
        public InstalacaoBioterio? InstalacaoBioterioRetorno { get; set; }
        public string? Responsavel { get; set; }
    }
}
