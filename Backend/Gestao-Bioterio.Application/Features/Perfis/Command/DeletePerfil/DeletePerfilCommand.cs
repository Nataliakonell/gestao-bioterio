using MediatR;

namespace Gestao_Bioterio.Application.Features.Perfis.Command.DeletePerfil
{
    public class DeletePerfilCommand : IRequest
    {
        public int Id { get; set; }
    }
}
