namespace Gestao_Bioterio.Application.Features.SolicitacoesExame.Command.CreateSolicitacaoExame
{
    public class CreateSolicitacaoExameDto
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string TipoExame { get; set; } = string.Empty;
        public string? SinaisClinicos { get; set; }
        public string? SuspeitaClinica { get; set; }
        public string RegiaoAnatomica { get; set; } = string.Empty;
        public string? Observacao { get; set; }
        public DateTime DataCriacao { get; set; }
        public string RF { get; set; } = string.Empty;
        public string Status { get; set; } = "Ativa";
        public DateTime? DataSuspensao { get; set; }
        public string? MotivoSuspensao { get; set; }
        public DateTime? DataCancelamento { get; set; }
        public string? MotivoCancelamento { get; set; }
        public string? Responsavel { get; set; }
    }
}