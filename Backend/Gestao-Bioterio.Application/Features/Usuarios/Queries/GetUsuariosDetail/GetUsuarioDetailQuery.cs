using MediatR;

namespace Gestao_Bioterio.Application.Features.Usuarios.Queries.GetUsuariosDetail
{
    public class GetUsuarioDetailQuery : IRequest<UsuarioDetailVm>
    {
        public int Id { get; set; }
    }
}
