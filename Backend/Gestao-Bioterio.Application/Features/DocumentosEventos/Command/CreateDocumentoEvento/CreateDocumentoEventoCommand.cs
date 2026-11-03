using MediatR;

namespace Gestao_Bioterio.Application.Features.DocumentosEventos.Command.CreateDocumentoEvento
{
    public class CreateDocumentoEventoCommand : IRequest<CreateDocumentoEventoResponse>
    {
        public int EventoId { get; set; }
        public int ModeloDocumentoId { get; set; }
        public string ConteudoDadosJson { get; set; } = string.Empty;
    }
}
