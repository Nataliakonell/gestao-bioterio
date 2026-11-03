using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAlimentacaoDetail;

namespace Gestao_Bioterio.Application.Features.Alimentacoes.Command.UpdateAlimentacao
{
    public class UpdateAlimentacaoResponse : BaseResponse
    {
        public UpdateAlimentacaoResponse() : base()
        {
        }

        public int Id { get; set; }
        public GetAlimentacaoDetailVm Alimentacao { get; set; } = default!;
    }
}
