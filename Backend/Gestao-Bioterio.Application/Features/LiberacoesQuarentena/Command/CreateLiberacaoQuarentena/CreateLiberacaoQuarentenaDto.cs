namespace Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.CreateLiberacaoQuarentena
{
    public class CreateLiberacaoQuarentenaDto
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public DateTime DataEntradaQuarentena { get; set; }
        public DateTime DataSaidaQuarentena { get; set; }
        public int? InstalacaoBioterioId { get; set; }
        public string? Responsavel { get; set; }
    }
}
