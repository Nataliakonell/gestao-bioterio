using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.Species.Command.CreateSpecie
{
    public class CreateEspecieResponse : BaseResponse
    {
        public CreateEspecieResponse(): base()
        {
        }
        public CreateEspecieDto Specie { get; set; } = default!;
        public int Id { get; set; }
    }
}