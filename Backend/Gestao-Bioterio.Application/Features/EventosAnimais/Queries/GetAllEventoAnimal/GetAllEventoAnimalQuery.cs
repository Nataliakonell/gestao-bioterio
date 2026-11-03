using MediatR;

namespace Gestao_Bioterio.Application.Features.EventosAnimais.Queries.GetAllEventoAnimal
{
    public class GetAllEventoAnimalQuery : IRequest<List<EventoAnimalListVm>>
    {
        public int? EventoId { get; set; }
    }
}
