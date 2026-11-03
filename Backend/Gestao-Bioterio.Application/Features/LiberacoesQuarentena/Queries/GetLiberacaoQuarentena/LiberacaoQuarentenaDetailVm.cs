namespace Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Queries.GetLiberacaoQuarentena
{
    public class LiberacaoQuarentenaDetailVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public DateTime DataEntradaQuarentena { get; set; }
        public DateTime DataSaidaQuarentena { get; set; }
        public int? InstalacaoBioterioId { get; set; }
        public DateTime DataCriacao { get; set; }
        public string RF { get; set; } = string.Empty;
        public string NomeProfissional { get; set; } = string.Empty;
        public string? Responsavel { get; set; }
    }
}
