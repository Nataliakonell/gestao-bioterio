using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Command.CreateRotinaAnimal
{
    public class CreateRotinaAnimalResponse : BaseResponse
    {
        public CreateRotinaAnimalResponse() : base()
        {
        }
        public List<CreateRotinaAnimalDto> Rotinas { get; set; } = [];
    }
}
