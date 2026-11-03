using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Command.CreateMovimentacaoAnimal
{
    public class CreateMovimentacaoAnimalResponse : BaseResponse
    {
        public CreateMovimentacaoAnimalResponse() : base()
        {
        }

        public int Id { get; set; }
        public CreateMovimentacaoAnimalDto MovimentacaoAnimal { get; set; } = default!;
    }
}
