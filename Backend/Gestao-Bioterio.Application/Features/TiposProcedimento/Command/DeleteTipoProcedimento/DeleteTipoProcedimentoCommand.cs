using MediatR;

namespace Gestao_Bioterio.Application.Features.TiposProcedimento.Command.DeleteTipoProcedimento
{
    public class DeleteTipoProcedimentoCommand : IRequest
    {
        public int Id { get; set; }
    }
}
