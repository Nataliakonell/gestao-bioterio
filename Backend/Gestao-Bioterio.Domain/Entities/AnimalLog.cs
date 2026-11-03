using Gestao_Bioterio.Domain.Common;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Domain.Entities
{
    public class AnimalLog : LogAuditableEntity
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string NumeroRegistro { get; set; } = string.Empty;
        public string NomePopular { get; set; } = string.Empty;
        public int EspecieId { get; set; }
        public Genero Genero { get; set; }
        public FaseDeVida FaseDeVida { get; set; }
        public DateTime DataDeEntrada { get; set; }
        public string Municipio { get; set; } = string.Empty;
        public string NumeroChip { get; set; } = string.Empty;
        public bool Sisfauna { get; set; }
        public bool TermoDeDoacao { get; set; }      
        public Situacao Situacao { get; set; } 
        public Animal? Animal { get; set; }
        public int LocalOrigemId { get; set; }
        public LocalOrigem? LocalOrigem { get; set; }
        public int InstalacaoBioterioId { get; set; }
        public InstalacaoBioterio? InstalacaoBioterio { get; set; }
        public string? NomeArquivoFoto { get; set; }
    }
}
