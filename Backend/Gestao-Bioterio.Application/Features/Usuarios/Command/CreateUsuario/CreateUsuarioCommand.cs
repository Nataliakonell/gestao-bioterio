using MediatR;

namespace Gestao_Bioterio.Application.Features.Usuarios.Command.CreateUsuario
{
    public class CreateUsuarioCommand : IRequest<CreateUsuarioResponse>
    {
        public string RF { get; set; } = string.Empty;
        public bool Status { get; set; } = true;
        public int PerfilId { get; set; }
    }
}
