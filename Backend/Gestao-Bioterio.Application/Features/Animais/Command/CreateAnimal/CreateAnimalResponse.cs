using Gestao_Bioterio.Application.Features.Animais.Queries.GetAnimalDetail;
using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.Animais.Command.CreateAnimal
{
    public class CreateAnimalResponse : BaseResponse
    {
        public CreateAnimalResponse(): base()
        {
        }
        public RotinaAnimalDetailVm Animal { get; set; } = default!;
        public int Id { get; set; }
    }
}
