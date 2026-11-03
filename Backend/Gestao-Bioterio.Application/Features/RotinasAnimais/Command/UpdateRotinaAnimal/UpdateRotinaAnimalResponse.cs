using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Command.UpdateRotinaAnimal
{
    public class UpdateRotinaAnimalResponse : BaseResponse
    {
        public List<UpdateRotinaAnimalDto>? Rotinas { get; set; }
    }
}
