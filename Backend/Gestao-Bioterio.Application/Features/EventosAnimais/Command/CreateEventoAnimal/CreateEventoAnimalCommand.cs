using MediatR;

namespace Gestao_Bioterio.Application.Features.EventosAnimais.Command.CreateEventoAnimal
{
    public class CreateEventoAnimalCommand : IRequest<CreateEventoAnimalResponse>
    {
        public int EventoId { get; set; }
        public int AnimalId { get; set; }
    }
}
