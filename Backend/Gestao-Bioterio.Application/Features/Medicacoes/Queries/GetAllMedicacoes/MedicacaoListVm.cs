namespace Gestao_Bioterio.Application.Features.Medicacoes.Queries.GetAllMedicacoes
{
    public class MedicacaoListVm
    {
        public int Id { get; set; }
        public string PrincipioAtivo { get; set; } = string.Empty;
        public string NomeComercial { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }
}