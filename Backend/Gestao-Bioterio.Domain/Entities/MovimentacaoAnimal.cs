using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class MovimentacaoAnimal : AuditableEntity
    {
        public int Id { get; set; }
        public int AnimalId{ get; set; }
        public int LocalizacaoId { get; set; }
        public int? EventoId { get; set; }
        public TipoMovimentacao TipoMovimentacao { get; set; }
    }
    public enum TipoMovimentacao 
    {
        Transferencia = 1,
        SaidaEvento = 2,
        RetornoEvento = 3,
        AtendimentoClinico = 4,
        RetornoAmbulatorio = 5,    
    }    
}
