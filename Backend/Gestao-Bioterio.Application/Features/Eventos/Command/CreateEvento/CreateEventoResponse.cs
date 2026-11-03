using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.Eventos.Command.CreateEvento
{
    public class CreateEventoResponse : BaseResponse
    {
        public CreateEventoResponse() : base()
        {
        }

        public int Id { get; set; }
        public CreateEventoDto Evento { get; set; } = default!;
    }
}
