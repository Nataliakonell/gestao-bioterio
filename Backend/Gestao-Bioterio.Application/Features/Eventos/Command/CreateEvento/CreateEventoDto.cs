using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.Eventos.Command.CreateEvento
{
    public class CreateEventoDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public TipoEvento TipoEvento { get; set; }
        public DateTime DataHoraInicio { get; set; }
        public DateTime DataHoraPrevisaoRetorno { get; set; }
        public string Responsavel { get; set; } = string.Empty;
        public Status Status { get; set; }
    }
}
