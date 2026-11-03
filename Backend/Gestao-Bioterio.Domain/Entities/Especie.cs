namespace Gestao_Bioterio.Domain.Entities
{
    public class Especie
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string NomePopular { get; set; } = string.Empty;
        public int GrupoId { get; set; }
        public Grupo? Grupo { get; set; }
        public ICollection<Animal> Animais { get; set; } = new List<Animal>();
    }
}
