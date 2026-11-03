namespace Gestao_Bioterio.Application.Features.Procedimentos.Command.CreateProcedimento
{
    public class CreateProcedimentoDto
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public int TipoProcedimentoId { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public string? Responsavel { get; set; }
    }
}