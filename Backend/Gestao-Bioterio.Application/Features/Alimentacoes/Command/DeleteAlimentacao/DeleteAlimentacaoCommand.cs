using MediatR;

namespace Gestao_Bioterio.Application.Features.Alimentacoes.Command.DeleteAlimentacao
{
    public class DeleteAlimentacaoCommand : IRequest
    {
        public int Id { get; set; }
    }
}
