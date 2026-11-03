using Gestao_Bioterio.Application.Features.Animais.Queries.GetAnimalDetail;
using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.Animais.Command.UpdateAnimal
{
    public class UpdateAnimalResponse : BaseResponse
    {
        public UpdateAnimalResponse() : base()
        {
        }

        public int Id { get; set; }
        public RotinaAnimalDetailVm Animal { get; set; } = default!;
    }
}
