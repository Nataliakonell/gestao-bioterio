using MediatR;

namespace Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Queries.GetAllMovimentacaoAnimal
{
    public class GetAllMovimentacaoAnimalQuery : IRequest<List<MovimentacaoAnimalListVm>>
    {
        public int? AnimalId { get; set; }
    }
}
