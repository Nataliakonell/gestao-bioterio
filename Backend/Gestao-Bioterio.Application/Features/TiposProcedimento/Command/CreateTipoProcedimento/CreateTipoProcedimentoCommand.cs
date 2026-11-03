using MediatR;

namespace Gestao_Bioterio.Application.Features.TiposProcedimento.Command.CreateTipoProcedimento
{
    public class CreateTipoProcedimentoCommand : IRequest<CreateTipoProcedimentoResponse>
    {
        public string Nome { get; set; } = string.Empty;
    }
}
