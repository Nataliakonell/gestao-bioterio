using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.DocumentosEventos.Command.CreateDocumentoEvento
{
    public class CreateDocumentoEventoResponse : BaseResponse
    {
        public CreateDocumentoEventoResponse() : base()
        {
        }

        public int Id { get; set; }
        public CreateDocumentoEventoDto DocumentoEvento { get; set; } = default!;
    }
}
