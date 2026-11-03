using MediatR;

namespace Gestao_Bioterio.Application.Features.Groups.Command.DeleteGroup
{
    public class DeleteGrupoCommand : IRequest
    {
        public int Id { get; set; }
    }
}