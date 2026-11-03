namespace Gestao_Bioterio.Application.Features.Procedimentos.Queries.GetAllProcedimentos
{
    public class ProcedimentoListVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public int TipoProcedimentoId { get; set; }
        public string TipoProcedimentoNome { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public DateTime DataCriacao { get; set; }
        public string RF { get; set; } = string.Empty;
        public string NomeProfissional { get; set; } = string.Empty;
        public string? Responsavel { get; set; }
    }
}