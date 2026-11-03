using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.Groups.Command.CreateGroup
{
    public class CreateGrupoResponse : BaseResponse
    {
        public CreateGrupoResponse(): base()
        {
        }
        public CreateGrupoDto Grupo { get; set; } = default!;
        public int Id { get; set; }
    }
}