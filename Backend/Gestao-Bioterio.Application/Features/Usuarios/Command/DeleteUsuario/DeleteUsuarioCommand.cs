using MediatR;

namespace Gestao_Bioterio.Application.Features.Usuarios.Command.DeleteUsuario
{
    public class DeleteUsuarioCommand : IRequest
    {
        public int Id { get; set; }
    }
}
