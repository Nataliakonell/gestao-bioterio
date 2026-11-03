namespace Gestao_Bioterio.Application.Features.AltaAmbulatorial.Queries.GetAllAltasAmbulatoriais
{
    public class AltaAmbulatoriaListVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string? NumeroRegistro { get; set; }
        public DateTime? DataEntradaAmbulatorio { get; set; }
        public DateTime DataAltaClinica { get; set; }
        public string? ProcedimentosMedicacoes { get; set; }
        public string? ObservacoesClinicas { get; set; }
        public int? InstalacaoBioterioRetornoId { get; set; }
        public string? InstalacaoBioterioRetornoNome { get; set; }
        public string? Responsavel { get; set; }
        public string? RF { get; set; }
        public DateTime? DataCriacao { get; set; }
    }
}
