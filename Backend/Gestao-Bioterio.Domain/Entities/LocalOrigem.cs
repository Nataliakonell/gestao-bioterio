namespace Gestao_Bioterio.Domain.Entities
{
    public class LocalOrigem
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public bool Ativo { get; set; } = true;
        public ICollection<Animal> Animais { get; set; } = new List<Animal>();
    }
}
