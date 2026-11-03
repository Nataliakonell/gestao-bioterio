using MediatR;

namespace Gestao_Bioterio.Application.Features.Eventos.Queries.GetEventoDetail
{
    public class GetEventoDetailQuery : IRequest<EventoDetailVm?>
    {
        public int Id { get; set; }
    }
}
