namespace Gestao_Bioterio.Application.Features.BiometriaAnimais.Command.CreateBiometriaAnimais
{
    public class CreateBiometriaAnimalDto
    {
        public decimal Peso { get; set; }
        public decimal Comprimento { get; set; }
        public DateTime DataBiometria { get; set; }
    }
}
