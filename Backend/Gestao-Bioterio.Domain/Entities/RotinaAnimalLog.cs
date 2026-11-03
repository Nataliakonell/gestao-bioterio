using Gestao_Bioterio.Domain.Common;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Domain.Entities
{
    public class RotinaAnimalLog : LogAuditableEntity
    {
        public int Id { get; set; }
        public int RotinaAnimalId { get; set; }
        public RotinaAnimal? RotinaAnimal { get; set; }
        public int EspecieId { get; set; }
        public TipoRotina TipoRotina { get; set; }
        public FaseDeVida FaseDeVida { get; set; }
        public TipoFrequencia TipoFrequencia { get; set; }
        public int? Frequencia { get; set; }
        public List<string>? DiaSemanaProgramado { get; set; }
        public string? ProtocoloDieta { get; set; }
    }
}
