namespace Gestao_Bioterio.Domain.Entities
{
    public class Perfil
    {
        public int Id { get; set; }
        public string Nome  { get; set; }
        public string Descricao { get; set; }
        public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
        public ICollection<PerfilPermissao> PerfilPermissoes { get; set; } = new List<PerfilPermissao>();
    }
}
