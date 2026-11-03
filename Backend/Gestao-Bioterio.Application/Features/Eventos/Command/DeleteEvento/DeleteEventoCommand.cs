using MediatR;

namespace Gestao_Bioterio.Application.Features.Eventos.Command.DeleteEvento
{
    public class DeleteEventoCommand : IRequest
    {
        public int Id { get; set; }
    }
}
