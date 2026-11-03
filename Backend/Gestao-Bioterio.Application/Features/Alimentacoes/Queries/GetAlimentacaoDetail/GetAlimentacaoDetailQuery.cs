using MediatR;

namespace Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAlimentacaoDetail
{
    public class GetAlimentacaoDetailQuery : IRequest<GetAlimentacaoDetailVm>
    {
        public int Id { get; set; }
    }
}
