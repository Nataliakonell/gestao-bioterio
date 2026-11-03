using Gestao_Bioterio.Domain.Common;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Domain.Entities
{
    public class BiometriaAnimal : AuditableEntity
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public decimal Peso { get; set; }
        public decimal? Comprimento { get; set; }
        public decimal? ComprimentoCauda { get; set; }
        public DateTime DataBiometria { get; set; }
        public Animal Animal { get; set; } = null!;
    }
}