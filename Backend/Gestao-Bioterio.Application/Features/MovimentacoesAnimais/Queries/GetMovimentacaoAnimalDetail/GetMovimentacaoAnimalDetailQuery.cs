using MediatR;

namespace Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Queries.GetMovimentacaoAnimalDetail
{
    public class GetMovimentacaoAnimalDetailQuery : IRequest<MovimentacaoAnimalDetailVm?>
    {
        public int Id { get; set; }
    }
}
