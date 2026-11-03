using MediatR;

namespace Gestao_Bioterio.Application.Features.Procedimentos.Command.CreateProcedimento
{
    public class CreateProcedimentoCommand : IRequest<CreateProcedimentoResponse>
    {
        public int AnimalId { get; set; }
        public int TipoProcedimentoId { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public string? Responsavel { get; set; }
    }
}