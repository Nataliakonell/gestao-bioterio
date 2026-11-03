using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAlimentacaoDetail;

namespace Gestao_Bioterio.Application.Features.Alimentacoes.Command.CreateAlimentacao
{
    public class CreateAlimentacaoResponse : BaseResponse
    {
        public CreateAlimentacaoResponse() : base()
        {
        }
        public GetAlimentacaoDetailVm Alimentacao { get; set; } = default!;
        public int Id { get; set; }
    }
}
