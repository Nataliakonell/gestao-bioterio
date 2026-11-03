using MediatR;

namespace Gestao_Bioterio.Application.Features.DocumentosEventos.Command.DeleteDocumentoEvento
{
    public class DeleteDocumentoEventoCommand : IRequest
    {
        public int Id { get; set; }
    }
}
