using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class Localizacao : AuditableEntity
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public int? LocalizacaoPaiId { get; set; }
        public Ambiente Ambiente { get; set; }
        public string? CaminhoIds { get; set; }
        public string? CaminhoHierarquia { get; set; }
        public Localizacao? LocalizacaoPai { get; set; }
        public ICollection<Localizacao> SubLocalizacoes { get; set; } = new List<Localizacao>();
        public ICollection<AnimalLocalizacao> AnimaisLocalizados { get; set; }  = new List<AnimalLocalizacao>();
    }
    public enum Ambiente
    {
        Interno = 1,
        Externo= 2,
    }
}
