using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.EventosAnimais.Command.CreateEventoAnimal
{
    public class CreateEventoAnimalResponse : BaseResponse
    {
        public CreateEventoAnimalResponse() : base()
        {
        }

        public int Id { get; set; }
        public CreateEventoAnimalDto EventoAnimal { get; set; } = default!;
    }
}
