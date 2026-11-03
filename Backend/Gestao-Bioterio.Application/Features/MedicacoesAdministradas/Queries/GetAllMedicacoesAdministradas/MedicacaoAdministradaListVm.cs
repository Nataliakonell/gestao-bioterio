namespace Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Queries.GetAllMedicacoesAdministradas
{
    public class MedicacaoAdministradaListVm
    {
        public int Id { get; set; }
        public int PrescricaoMedicacaoId { get; set; }
        public int AnimalId { get; set; }
        public string MedicacaoNome { get; set; } = string.Empty;
        public DateTime DataHoraPrevista { get; set; }
        public DateTime? DataHoraAdministracao { get; set; }
        public string Responsavel { get; set; } = string.Empty;
        public string StatusDose { get; set; } = string.Empty;
        public string Observacao { get; set; } = string.Empty;
    }
}