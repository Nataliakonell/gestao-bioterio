namespace Gestao_Bioterio.Application.Features.BiometriaAnimais.Queries.GetAllBiometriaAnimal
{
    public class BiometriaAnimalListVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public decimal Peso { get; set; }
        public decimal? Comprimento { get; set; }
        public decimal? ComprimentoCauda { get; set; }
        public DateTime DataBiometria { get; set; }
        public DateTime DataCriacao { get; set; }

        public string NumeroRegistro { get; set; } = string.Empty;
        public string EspecieNome { get; set; } = string.Empty;
        public string FaseDeVida { get; set; } = string.Empty;
    }
}
