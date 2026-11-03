using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.EventosAnimais.Command.UpdateEventoAnimal
{
    public class UpdateEventoAnimalCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public int EventoId { get; set; }
        public int AnimalId { get; set; }
    }
}
