using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Command.CreateRotinaAnimal
{
    public class CreateRotinaAnimalDto
    {
        public int Id { get; set; }
        public int EspecieId { get; set; }
        public TipoRotina TipoRotina { get; set; }
        public string FaseDeVida { get; set; } = string.Empty;
        public TipoFrequencia TipoFrequencia { get; set; }
        public int? Frequencia { get; set; }
        public string? ProtocoloDieta { get; set; }
        public List<string>? DiaSemanaProgramado { get; set; }
    }
}
