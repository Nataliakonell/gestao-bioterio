using MediatR;

namespace Gestao_Bioterio.Application.Features.Groups.Command.UpdateGroup
{
    public class UpdateGrupoCommand : IRequest
    {
        public int Id { get; set; }
        public string? Nome { get; set; }
    }
}