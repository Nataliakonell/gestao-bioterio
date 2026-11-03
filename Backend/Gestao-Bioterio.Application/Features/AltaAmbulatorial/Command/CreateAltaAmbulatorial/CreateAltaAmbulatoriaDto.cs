namespace Gestao_Bioterio.Application.Features.AltaAmbulatorial.Command.CreateAltaAmbulatorial
{
    public class CreateAltaAmbulatoriaDto
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public DateTime? DataEntradaAmbulatorio { get; set; }
        public DateTime? DataAltaClinica { get; set; }
        public string? ProcedimentosMedicacoes { get; set; }
        public string? ObservacoesClinicas { get; set; }
        public int? InstalacaoBioterioRetornoId { get; set; }
        public string? Responsavel { get; set; }
    }
}
