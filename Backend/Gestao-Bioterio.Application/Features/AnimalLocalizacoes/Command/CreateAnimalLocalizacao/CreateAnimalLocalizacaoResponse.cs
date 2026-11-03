using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.CreateAnimalLocalizacao
{
    public class CreateAnimalLocalizacaoResponse : BaseResponse
    {
        public CreateAnimalLocalizacaoResponse() : base()
        {
        }

        public int Id { get; set; }
        public CreateAnimalLocalizacaoDto AnimalLocalizacao { get; set; } = default!;
    }
}
