using Gestao_Bioterio.Domain.Common;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Domain.Entities
{
    public class RotinaAnimal : AuditableEntity
    {
        public int Id { get; set; }
        public int EspecieId { get; set; }
        public Especie? Especie { get; set; }
        public TipoRotina TipoRotina { get; set; }
        public FaseDeVida FaseDeVida { get; set; }
        public TipoFrequencia TipoFrequencia { get; set; }
        public int? Frequencia { get; set; }
        public List<string>? DiaSemanaProgramado { get; set; }
        public string? ProtocoloDieta { get; set; }
    }
    public enum TipoRotina
    {
        Alimentacao = 1,
        Biometria = 2
    }
    public enum StatusRotina
    {
        SemRegistro = 1,
        Hoje = 2,
        Proximo = 3,
        Concluido = 4,
        EmDia = 5,
        Atrasado = 6,
        NaoAlimentado = 7
    }
    public enum TipoFrequencia
    {
        Diaria = 1,
        IntervaloEmDias = 2,
        DiasDaSemana = 3
    }
}
