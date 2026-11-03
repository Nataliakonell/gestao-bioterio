using MediatR;

namespace Gestao_Bioterio.Application.Features.Funcionalidade.Command.DeleteFuncionalidade
{
    public class DeleteFuncionalidadeCommand : IRequest
    {
        public int Id { get; set; }
    }
}
