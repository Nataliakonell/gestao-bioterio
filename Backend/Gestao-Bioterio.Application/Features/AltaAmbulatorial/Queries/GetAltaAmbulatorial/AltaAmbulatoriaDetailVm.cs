namespace Gestao_Bioterio.Application.Features.AltaAmbulatorial.Queries.GetAltaAmbulatorial
{
    public class AltaAmbulatoriaDetailVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public DateTime? DataEntradaAmbulatorio { get; set; }
        public DateTime? DataAltaClinica { get; set; }
        public string? ProcedimentosMedicacoes { get; set; }
        public string? ObservacoesClinicas { get; set; }
        public int? InstalacaoBioterioRetornoId { get; set; }
        public DateTime DataCriacao { get; set; }
        public string RF { get; set; } = string.Empty;
        public string NomeProfissional { get; set; } = string.Empty;
        public string? Responsavel { get; set; }
    }
}
