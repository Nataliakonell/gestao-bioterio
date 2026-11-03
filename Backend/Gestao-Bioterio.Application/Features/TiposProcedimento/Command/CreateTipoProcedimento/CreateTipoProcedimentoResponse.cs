using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.TiposProcedimento.Command.CreateTipoProcedimento
{
    public class CreateTipoProcedimentoResponse : BaseResponse
    {
        public CreateTipoProcedimentoResponse() : base()
        {
        }

        public CreateTipoProcedimentoDto TipoProcedimento { get; set; } = default!;
        public int Id { get; set; }
    }
}
