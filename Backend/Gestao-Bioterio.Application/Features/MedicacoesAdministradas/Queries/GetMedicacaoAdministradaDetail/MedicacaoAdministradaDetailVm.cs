namespace Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Queries.GetMedicacaoAdministradaDetail
{
    public class MedicacaoAdministradaDetailVm
    {
        public int Id { get; set; }
        public int PrescricaoMedicacaoId { get; set; }
        public DateTime? DataHoraAdministracao { get; set; }
        public DateTime DataHoraPrevista { get; set; }
        public string Observacao { get; set; } = string.Empty;
        public string Responsavel { get; set; } = string.Empty;
        public string StatusDose { get; set; } = string.Empty;
    }
}