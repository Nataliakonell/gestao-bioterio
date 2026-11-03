using MediatR;

namespace Gestao_Bioterio.Application.Features.Refeicoes.Queries.GetRefeicaoDetail
{
    public class GetRefeicaoDetailQuery : IRequest<GetRefeicaoDetailVm>
    {
        public int Id { get; set; }
    }
}
