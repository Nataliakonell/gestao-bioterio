using MediatR;

namespace Gestao_Bioterio.Application.Features.DocumentosEventos.Queries.GetAllDocumentoEvento
{
    public class GetAllDocumentoEventoQuery : IRequest<List<DocumentoEventoListVm>>
    {
        public int? EventoId { get; set; }
    }
}
