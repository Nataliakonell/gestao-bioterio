using Gestao_Bioterio.Domain.Common;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Domain.Entities
{
    public class Animal : AuditableEntity
    {
        public int Id { get; set; }  
        public string NumeroRegistro  { get; set; } = string.Empty;
        public string NomePopular { get; set; } = string.Empty;
        public int EspecieId { get; set; }
        public Especie? Especie { get; set; }

        public InstalacaoBioterio? InstalacaoBioterio { get; set; }
        public int InstalacaoBioterioId { get; set; }

        public Genero Genero { get; set; }
        public FaseDeVida FaseDeVida { get; set; }
        public DateTime DataDeEntrada { get; set; }
        public Situacao SituacaoAnimal{ get; set; }

        public string Municipio { get; set; } = string.Empty;
        public string NumeroChip { get; set; } = string.Empty;
        public bool Sisfauna { get; set; }
        public bool TermoDeDoacao { get; set; }

        public int LocalOrigemId { get; set; }
        public LocalOrigem? LocalOrigem { get; set; }
        public string? NomeArquivoFoto { get; set; } = string.Empty;

        public AnimalLocalizacao? AnimalLocalizacao { get; set; }

        public ICollection<BiometriaAnimal> BiometriaAnimais { get; set; } = new List<BiometriaAnimal>();
        public ICollection<ProtocoloDesverminacao> ProtocolosDesverminacao { get; set; } = new List<ProtocoloDesverminacao>();
    }
    public enum Genero
    {
        Macho = 1,
        Femea = 2,
        NaoIdentificado = 3
    }
    public enum FaseDeVida
    {
        Filhote = 1,
        Jovem = 2,
        Adulto = 3,
        Todos = 4
    }
    public enum Situacao
    {
        Vivo = 1,
        Obito = 2,
        Reintroduzido = 3
    }
}
