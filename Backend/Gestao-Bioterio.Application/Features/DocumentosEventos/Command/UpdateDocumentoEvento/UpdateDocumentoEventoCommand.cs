using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.DocumentosEventos.Command.UpdateDocumentoEvento
{
    public class UpdateDocumentoEventoCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public int EventoId { get; set; }
        public int ModeloDocumentoId { get; set; }
        public string ConteudoDadosJson { get; set; } = string.Empty;
    }
}
