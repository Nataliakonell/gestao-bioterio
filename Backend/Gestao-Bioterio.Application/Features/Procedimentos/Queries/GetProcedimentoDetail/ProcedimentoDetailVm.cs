namespace Gestao_Bioterio.Application.Features.Procedimentos.Queries.GetProcedimentoDetail
{
    public class ProcedimentoDetailVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public int TipoProcedimentoId { get; set; }
        public string TipoProcedimentoNome { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public string? Responsavel { get; set; }
    }
}