using MediatR;

namespace Gestao_Bioterio.Application.Features.Consultas.Command.CreateConsulta
{
    public class CreateConsultaCommand : IRequest<CreateConsultaResponse>
    {
        public int AnimalId { get; set; }
        public string? Anamnese { get; set; }
        public string? ExameFisico { get; set; }
        public string? SuspeitaDiagnostica { get; set; }
        public int? InstalacaoBioterioId { get; set; }
        public DateTime DataHoraConsulta { get; set; } = DateTime.Now;
        public string? Responsavel { get; set; }
    }
}
