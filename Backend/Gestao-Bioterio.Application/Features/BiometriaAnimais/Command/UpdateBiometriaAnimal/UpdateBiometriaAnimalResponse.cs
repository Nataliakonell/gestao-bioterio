using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Application.Features.BiometriaAnimais.Queries.GetBiometriaAnimalDetail;

namespace Gestao_Bioterio.Application.Features.BiometriaAnimais.Command.UpdateBiometriaAnimal
{
    public class UpdateBiometriaAnimalResponse : BaseResponse
    {
        public UpdateBiometriaAnimalResponse() : base()
        {
        }

        public int Id { get; set; }
        public GetBiometriaAnimalDetailVm BiometriaAnimal { get; set; } = default!;
    }
}
