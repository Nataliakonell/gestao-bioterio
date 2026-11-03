using MediatR;

namespace Gestao_Bioterio.Application.Features.DocumentosEventos.Queries.GetDocumentoEventoDetail
{
    public class GetDocumentoEventoDetailQuery : IRequest<DocumentoEventoDetailVm?>
    {
        public int Id { get; set; }
    }
}
