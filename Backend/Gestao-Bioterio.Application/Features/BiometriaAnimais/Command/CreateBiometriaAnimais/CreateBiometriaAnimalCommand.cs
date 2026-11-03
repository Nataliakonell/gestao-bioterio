using MediatR;

namespace Gestao_Bioterio.Application.Features.BiometriaAnimais.Command.CreateBiometriaAnimais
{
    public class CreateBiometriaAnimalCommand : IRequest<CreateBiometriaAnimalResponse>
    {
        public int AnimalId { get; set; }
        public decimal Peso { get; set; }
        public decimal? Comprimento { get; set; }
        public decimal? ComprimentoCauda { get; set; }
        public DateTime DataBiometria { get; set; }
    }
}
