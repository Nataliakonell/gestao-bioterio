namespace Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Queries.GetAllLiberacoesQuarentena
{
    public class LiberacaoQuarentenaListVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public int? AtendimentoId { get; set; }
        public DateTime DataEntradaQuarentena { get; set; }
        public DateTime DataSaidaQuarentena { get; set; }
        public int? InstalacaoBioterioId { get; set; }
        public string? InstalacaoBioterioNome { get; set; }
        public string? NumeroRegistro { get; set; }
        public string? Responsavel { get; set; }
        public string? RF { get; set; }
        public DateTime? DataCriacao { get; set; }
    }
}
