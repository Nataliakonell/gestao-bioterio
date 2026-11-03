using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.TiposProcedimento.Command.UpdateTipoProcedimento
{
    public class UpdateTipoProcedimentoCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }
}
