namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Queries.GetProtocoloDesverminacaoDetail
{
    public class DoseDesverminacaoVm
    {
        public int Id { get; set; }
        public string TipoDose { get; set; } = string.Empty;
        public DateTime DataPrevista { get; set; }
        public DateTime? DataAplicacao { get; set; }
        public string StatusDoseDesverminacao { get; set; } = string.Empty;
        public string? Observacao { get; set; }
    }
}