using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Application.Features.Refeicoes.Queries.GetRefeicaoDetail;

namespace Gestao_Bioterio.Application.Features.Refeicoes.Command.UpdateRefeicao
{
    public class UpdateRefeicaoResponse : BaseResponse
    {
        public UpdateRefeicaoResponse() : base()
        {
        }

        public int Id { get; set; }
        public GetRefeicaoDetailVm Refeicao { get; set; } = default!;
    }
}
