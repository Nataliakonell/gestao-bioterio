using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.RegistrosObito.Command.CreateRegistroObito
{
    public class CreateRegistroObitoResponse : BaseResponse
    {
        public CreateRegistroObitoResponse() : base()
        {
        }

        public int Id { get; set; }
        public CreateRegistroObitoDto? RegistroObito { get; set; }
    }
}
