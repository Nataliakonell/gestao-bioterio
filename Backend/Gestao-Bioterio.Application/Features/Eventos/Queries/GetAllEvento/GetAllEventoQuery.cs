using MediatR;

namespace Gestao_Bioterio.Application.Features.Eventos.Queries.GetAllEvento
{
    public class GetAllEventoQuery : IRequest<List<EventoListVm>>
    {
    }
}
