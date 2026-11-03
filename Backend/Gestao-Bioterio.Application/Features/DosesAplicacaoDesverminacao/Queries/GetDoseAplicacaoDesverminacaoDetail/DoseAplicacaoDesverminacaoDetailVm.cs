namespace Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Queries.GetDoseAplicacaoDesverminacaoDetail
{
    public class DoseAplicacaoDesverminacaoDetailVm
    {
        public int Id { get; set; }
        public int ProtocoloDesverminacaoId { get; set; }
        public int? AnimalId { get; set; }
        public string TipoDose { get; set; } = string.Empty;
        public DateTime DataPrevista { get; set; }
        public DateTime? DataAplicacao { get; set; }
        public string StatusDoseDesverminacao { get; set; } = string.Empty;
        public string? Observacao { get; set; }
        public string? Responsavel { get; set; }
    }
}