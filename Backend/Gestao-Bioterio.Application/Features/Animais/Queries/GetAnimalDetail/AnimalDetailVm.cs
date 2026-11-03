using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.Animais.Queries.GetAnimalDetail
{
    public class RotinaAnimalDetailVm
    {
        public int Id { get; set; }
        public string NumeroRegistro { get; set; } = string.Empty;
        public string NomePopular { get; set; } = string.Empty;
        public string NumeroChip { get; set; } = string.Empty;
        public Genero Genero { get; set; }

        public string LocalOrigem { get; set; } = string.Empty;
        public string Municipio { get; set; } = string.Empty;
        public int LocalOrigemId { get; set; }
        public DateTime DataDeEntrada { get; set; }
        public FaseDeVida FaseDeVida { get; set; }
        public int? BiometriaAnimalId { get; set; }
        public bool Sisfauna { get; set; }
        public bool TermoDeDoacao { get; set; }
        public Situacao SituacaoAnimal { get; set; }

        public int EspecieId { get; set; }
        public string EspecieNome { get; set; } = string.Empty;
        public string Grupo { get; set; } = string.Empty;

        public int InstalacaoBioterioId { get; set; }
        public string InstalacaoBioterioNome { get; set; } = string.Empty;

        public int? LocalizacaoId { get; set; }
        public string? LocalizacaoNome { get; set; }
        public string? LocalizacaoHierarquia { get; set; }

        public byte[]? FotoAnimal { get; set; }
        public BiometriaAnimal? BiometriaAnimal { get; set; }
    }
}
