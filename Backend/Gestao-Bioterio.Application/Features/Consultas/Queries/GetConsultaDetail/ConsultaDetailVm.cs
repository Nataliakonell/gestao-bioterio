namespace Gestao_Bioterio.Application.Features.Consultas.Queries.GetConsultaDetail
{
    public class ConsultaDetailVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string NumeroRegistro { get; set; } = string.Empty;
        public string EspecieNome { get; set; } = string.Empty;
        public string? Anamnese { get; set; }
        public string? ExameFisico { get; set; }
        public string? SuspeitaDiagnostica { get; set; }
        public int? InstalacaoBioterioId { get; set; }
        public string InstalacaoBioterioNome { get; set; } = string.Empty;
        public DateTime DataHoraConsulta { get; set; }
        public string RF { get; set; } = string.Empty;
        public DateTime DataCriacao { get; set; }
        public string? Responsavel { get; set; }
    }
}
