using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.Procedimentos.Command.CreateProcedimento
{
    public class CreateProcedimentoResponse : BaseResponse
    {
        public CreateProcedimentoResponse() : base()
        {
        }
        public int Id { get; set; }
        public CreateProcedimentoDto? Procedimento { get; set; }
    }
}