using MediatR;

namespace Gestao_Bioterio.Application.Features.Procedimentos.Command.DeleteProcedimento
{
    public class DeleteProcedimentoCommand : IRequest
    {
        public int Id { get; set; }
    }
}