namespace Gestao_Bioterio.Domain.Entities
{
    public class Medicacao
    {
        public int Id { get; set; }
        public string PrincipioAtivo { get; set; } = string.Empty;
        public string NomeComercial { get; set; } = string.Empty;
        public bool Ativo { get; set; } = true;
        public ICollection<PrescricaoMedicacao> Prescricoes { get; set; } = new List<PrescricaoMedicacao>();
    }
}
