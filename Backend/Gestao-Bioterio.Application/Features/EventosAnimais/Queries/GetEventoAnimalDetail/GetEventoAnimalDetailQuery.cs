using MediatR;

namespace Gestao_Bioterio.Application.Features.EventosAnimais.Queries.GetEventoAnimalDetail
{
    public class GetEventoAnimalDetailQuery : IRequest<EventoAnimalDetailVm?>
    {
        public int Id { get; set; }
    }
}
