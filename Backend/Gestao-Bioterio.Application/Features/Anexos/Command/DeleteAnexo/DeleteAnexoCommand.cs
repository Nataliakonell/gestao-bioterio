using MediatR;

namespace Gestao_Bioterio.Application.Features.Anexos.Command.DeleteAnexo
{
    public class DeleteAnexoCommand : IRequest
    {
        public int Id { get; set; }
    }
}