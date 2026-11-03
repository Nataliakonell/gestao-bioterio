using MediatR;

namespace Gestao_Bioterio.Application.Features.Groups.Command.CreateGroup
{
    public class CreateGrupoCommand : IRequest<CreateGrupoResponse>
    {
        public string Nome { get; set; } = string.Empty;
    }
}