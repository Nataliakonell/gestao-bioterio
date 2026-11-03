namespace Gestao_Bioterio.Application.Features.TiposProcedimento.Command.CreateTipoProcedimento
{
    public class CreateTipoProcedimentoDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }
}
