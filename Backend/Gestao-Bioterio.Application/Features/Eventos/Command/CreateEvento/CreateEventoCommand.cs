using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Eventos.Command.CreateEvento
{
    public class CreateEventoCommand : IRequest<CreateEventoResponse>
    {
        public string Nome { get; set; } = string.Empty;
        public TipoEvento TipoEvento { get; set; }
        public DateTime DataHoraInicio { get; set; }
        public DateTime DataHoraPrevisaoRetorno { get; set; }
        public string Responsavel { get; set; } = string.Empty;
        public Status Status { get; set; } = Status.Agendado;
        public List<int>? AnimalIds { get; set; }
    }
}
