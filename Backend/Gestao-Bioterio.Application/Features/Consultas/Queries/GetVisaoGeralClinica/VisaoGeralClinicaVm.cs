namespace Gestao_Bioterio.Application.Features.Consultas.Queries.GetVisaoGeralClinica
{
    public class ResumoUltimoAtendimentoDto
    {
        public int Id { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public string TipoLabel { get; set; } = string.Empty;
        public DateTime DataHora { get; set; }
        public string Responsavel { get; set; } = string.Empty;
        public string Resumo { get; set; } = string.Empty;
    }

    public class VisaoGeralClinicaItemVm
    {
        public int AnimalId { get; set; }
        public string NumeroRegistro { get; set; } = string.Empty;
        public string NomePopular { get; set; } = string.Empty;
        public int EspecieId { get; set; }
        public string EspecieNome { get; set; } = string.Empty;
        public int FaseDeVida { get; set; }
        public string FaseDeVidaNome { get; set; } = string.Empty;
        public string GeneroNome { get; set; } = string.Empty;
        public string Localizacao { get; set; } = string.Empty;
        public int SituacaoAnimal { get; set; }
        public string SituacaoAnimalNome { get; set; } = string.Empty;
        public string StatusClinico { get; set; } = string.Empty;
        public int TotalAtendimentos { get; set; }
        public ResumoUltimoAtendimentoDto? UltimoAtendimento { get; set; }
    }

    public class VisaoGeralClinicaResponse
    {
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public VisaoGeralClinicaItemVm? DestaqueUltimoAtendimentoGeral { get; set; }
        public List<VisaoGeralClinicaItemVm> Items { get; set; } = new();
    }
}
