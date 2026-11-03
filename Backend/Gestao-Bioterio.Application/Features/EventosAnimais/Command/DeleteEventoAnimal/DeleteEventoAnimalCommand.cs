using MediatR;

namespace Gestao_Bioterio.Application.Features.EventosAnimais.Command.DeleteEventoAnimal
{
    public class DeleteEventoAnimalCommand : IRequest
    {
        public int Id { get; set; }
    }
}
