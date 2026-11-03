using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.Usuarios.Command.CreateUsuario
{
    public class CreateUsuarioResponse : BaseResponse
    {
        public CreateUsuarioResponse() : base()
        {
        }
        public int Id { get; set; }
        public CreateUsuarioDto? Usuario { get; set; }
    }
}
