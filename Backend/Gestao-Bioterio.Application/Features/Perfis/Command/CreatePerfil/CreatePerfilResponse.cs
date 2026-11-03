using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Application.Features.Usuarios.Command.CreateUsuario;

namespace Gestao_Bioterio.Application.Features.Perfis.Command.CreatePerfil
{
    public class CreatePerfilResponse : BaseResponse
    {
        public CreatePerfilResponse() : base()
        {
        }
        public int Id { get; set; }
        public CreatePerfilDto? Perfil { get; set; }
    }
}
