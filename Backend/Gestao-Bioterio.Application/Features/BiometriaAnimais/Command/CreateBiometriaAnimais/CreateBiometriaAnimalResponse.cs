using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.BiometriaAnimais.Command.CreateBiometriaAnimais
{
    public class CreateBiometriaAnimalResponse : BaseResponse
    {
        public CreateBiometriaAnimalResponse() : base()
        {
        }
        public CreateBiometriaAnimalDto BiometriaAnimal { get; set; } = default!;
        public int Id { get; set; }
    }
}
