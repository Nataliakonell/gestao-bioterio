using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.ModelosDocumento.Command.CreateModeloDocumento
{
    public class CreateModeloDocumentoResponse : BaseResponse
    {
        public CreateModeloDocumentoResponse() : base() { }
        public int Id { get; set; }
        public CreateModeloDocumentoDto ModeloDocumento { get; set; } = default!;
    }

}
