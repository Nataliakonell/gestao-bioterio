using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Eventos.Command.UpdateEvento
{
    public class UpdateEventoCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public TipoEvento TipoEvento { get; set; }
        public DateTime DataHoraInicio { get; set; }
        public DateTime DataHoraPrevisaoRetorno { get; set; }
        public string Responsavel { get; set; } = string.Empty;
        public Status Status { get; set; }
    }
}
