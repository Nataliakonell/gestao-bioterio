using MediatR;

namespace Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Command.DeleteMovimentacaoAnimal
{
    public class DeleteMovimentacaoAnimalCommand : IRequest
    {
        public int Id { get; set; }
    }
}
