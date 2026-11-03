using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAllRotinasAnimais
{
    public class RotinaAnimalListVm
    {
        public int Id { get; set; }
        public int EspecieId { get; set; }
        public string EspecieNome { get; set; } = string.Empty;
        public string TipoRotina { get; set; } = string.Empty;
        public string FaseDeVida { get; set; } = string.Empty;
        public string TipoFrequencia { get; set; } = string.Empty;
        public int? Frequencia { get; set; }
        public List<string>? DiaSemanaProgramado { get; set; }
        public string? ProtocoloDieta { get; set; }
    }
}
