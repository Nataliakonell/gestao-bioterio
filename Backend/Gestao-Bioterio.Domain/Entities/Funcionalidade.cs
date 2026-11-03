using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class Funcionalidade 
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Descricao { get; set; }
        public ICollection<PerfilPermissao> PerfilPermissoes { get; set; } = new List<PerfilPermissao>();
    }
}
