namespace Gestao_Bioterio.Domain.Entities
{
    public class Grupo
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public ICollection<Especie> Especies { get; set; } = new List<Especie>();
    }
}
