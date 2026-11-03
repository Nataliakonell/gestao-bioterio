using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.Refeicoes.Command.CreateRefeicao
{
    public class CreateRefeicaoDto
    {
        public int Id { get; set; }
        public int AlimentacaoId { get; set; }
        public TipoRefeicao TipoRefeicao { get; set; }
        public decimal PesoRefeicao { get; set; }
        public string SituacaoRefeicao { get; set; } = string.Empty;
    }
}
