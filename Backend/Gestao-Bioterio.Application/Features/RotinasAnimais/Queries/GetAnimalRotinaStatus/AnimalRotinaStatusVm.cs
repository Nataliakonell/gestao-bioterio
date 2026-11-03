using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAnimalRotinaStatus
{

    public class AnimalRotinaStatusVm
    {
        public int AnimalId { get; set; }
        public string NumeroRegistro { get; set; } = string.Empty;
        public string NomeAnimal { get; set; } = string.Empty;
        public string EspecieNome { get; set; } = string.Empty;
        public FaseDeVida FaseDeVida { get; set; }

        public RotinaStatusDetalheVm? Alimentacao { get; set; }
        public RotinaStatusDetalheVm? Biometria { get; set; }
    }

    public class RotinaStatusDetalheVm
    {
        public bool RotinaCadastrada { get; set; }
        public StatusRotina Status { get; set; }
        public string StatusDescricao { get; set; } = string.Empty;
        public DateTime? UltimaData { get; set; }
        public DateTime? ProximaData { get; set; }
        public TipoFrequencia? TipoFrequencia { get; set; }
        public int? Frequencia { get; set; }
        public List<string>? DiaSemanaProgramado { get; set; }
        public string? ProtocoloDieta { get; set; }
        public List<DiaSemanaStatusVm>? DiasSemanaStatus { get; set; }
    }
}
