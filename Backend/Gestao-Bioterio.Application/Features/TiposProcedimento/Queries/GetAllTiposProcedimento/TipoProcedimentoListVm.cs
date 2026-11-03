namespace Gestao_Bioterio.Application.Features.TiposProcedimento.Queries.GetAllTiposProcedimento
{
    public class TipoProcedimentoListVm
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }
}
