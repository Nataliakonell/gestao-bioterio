using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class Refeicao : AuditableEntity
    {
        public int Id { get; set; }
        public int AlimentacaoId { get; set; }
        public TipoRefeicao TipoRefeicao { get; set; }
        public decimal PesoRefeicao { get; set; }
        public string UnidadeDeMedida { get; set; }
        public SituacaoRefeicao SituacaoRefeicao { get; set; }
    }

    public enum SituacaoRefeicao
    { 
        Pendente = 0,
        Aceitou = 1,
        Negou = 2,
        Regurgitou = 3
    }

    public enum TipoRefeicao
    {
        Roedor = 1,
        Frutas = 2,
        Legumes = 3,
        Vegetais = 4,
        Insetos = 5,
        Ração = 6,
        Carne_Vermelha = 7,
        Ave = 8,
        Peixe = 9,
        Ovo = 10,
        Via_Sonda = 11
    }
}
