namespace Gestao_Bioterio.Application.Features.RegistrosObito.Queries.GetRegistroObitoDetail
{
    public class RegistroObitoDetailVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string NumeroRegistroAnimal { get; set; } = string.Empty;
        public string NomePopularAnimal { get; set; } = string.Empty;
        public DateTime DataObito { get; set; }
        public bool HouveNecropsia { get; set; }
        public string? Observacoes { get; set; }
        public DateTime DataCriacao { get; set; }
        public string? RF { get; set; }
    }
}
