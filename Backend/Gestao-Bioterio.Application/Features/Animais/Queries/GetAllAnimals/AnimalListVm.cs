using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.Animais.Queries.GetAllAnimals
{
    public class AnimalListVm
    {
        public int Id { get; set; }
        public string NumeroRegistro { get; set; } = string.Empty;
        public string NomePopular { get; set; } = string.Empty;
        public string NumeroChip { get; set; } = string.Empty;
        public Genero Genero { get; set; }
        public DateTime DataDeEntrada { get; set; }
        public string EspecieNome { get; set; } = string.Empty;
        public string Grupo { get; set; } = string.Empty;
        public string InstalacaoBioterioNome { get; set; } = string.Empty;
        public int? LocalizacaoId { get; set; }
        public string? LocalizacaoNome { get; set; }
        public string LocalOrigemNome { get; set; } = string.Empty;
        public FaseDeVida FaseDeVida { get; set; }
        public Situacao Situacao { get; set; }
        public int BiometriaAnimalId { get; set; }
        public BiometriaAnimal BiometriaAnimal { get; set; } = null!;
    }
}
