using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Procedimentos.Command.UpdateProcedimento
{
    public class UpdateProcedimentoCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public int TipoProcedimentoId { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public string? Responsavel { get; set; }
    }
}