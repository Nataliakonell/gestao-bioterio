namespace Gestao_Bioterio.Application.Features.Medicacoes.Command.CreateMedicacao
{
    public class CreateMedicacaoDto
    {
        public int Id { get; set; }
        public string PrincipioAtivo { get; set; } = string.Empty;
        public string NomeComercial { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }
}