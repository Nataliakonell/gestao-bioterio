using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.Refeicoes.Queries.GetRefeicaoDetail
{
    public class GetRefeicaoDetailVm
    {
        public int Id { get; set; }
        public int AlimentacaoId { get; set; }
        public Alimentacao Alimentacao { get; set; } = null!;
        public string TipoRefeicao { get; set; }
        public decimal PesoRefeicao { get; set; }
        public string UnidadeDeMedida { get; set; } = string.Empty;
        public SituacaoRefeicao SituacaoRefeicao { get; set; }
    }
}
