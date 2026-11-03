namespace Gestao_Bioterio.Application.Features.Consultas.Command.CreateConsulta
{
    public class CreateConsultaDto
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string? Anamnese { get; set; }
        public string? ExameFisico { get; set; }
        public string? SuspeitaDiagnostica { get; set; }
        public int? InstalacaoBioterioId { get; set; }
        public DateTime DataHoraConsulta { get; set; }
        public string? Responsavel { get; set; }
    }
}
