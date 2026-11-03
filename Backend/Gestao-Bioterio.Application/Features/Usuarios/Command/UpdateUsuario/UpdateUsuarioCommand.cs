using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Usuarios.Command.UpdateUsuario
{
    public class UpdateUsuarioCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public string RF { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool Status { get; set; } = true;
        public int PerfilId { get; set; }
    }
}
