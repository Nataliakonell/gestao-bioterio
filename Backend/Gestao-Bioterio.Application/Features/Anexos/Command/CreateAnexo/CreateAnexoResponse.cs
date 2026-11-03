using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.Anexos.Command.CreateAnexo
{
    public class CreateAnexoResponse : BaseResponse
    {
        public CreateAnexoResponse() : base()
        {
        }
        public int Id { get; set; }
        public CreateAnexoDto? Anexo { get; set; }
    }
}