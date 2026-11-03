using MediatR;

namespace Gestao_Bioterio.Application.Features.Refeicoes.Command.DeleteRefeicao
{
    public class DeleteRefeicaoCommand : IRequest
    {
        public int Id { get; set; }

    }
}
