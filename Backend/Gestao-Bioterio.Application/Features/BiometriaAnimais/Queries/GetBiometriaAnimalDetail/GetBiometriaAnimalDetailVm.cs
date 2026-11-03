namespace Gestao_Bioterio.Application.Features.BiometriaAnimais.Queries.GetBiometriaAnimalDetail
{
    public class GetBiometriaAnimalDetailVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string AnimalNumeroRegistro { get; set; } = string.Empty;
        public decimal Peso { get; set; }
        public decimal? Comprimento { get; set; }
        public decimal? ComprimentoCauda { get; set; }
        public DateTime DataBiometria { get; set; }
    }
}
