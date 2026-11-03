namespace Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.CreatePrescricaoMedicacao
{
    public class CreatePrescricaoMedicacaoDto
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public int MedicacaoId { get; set; }
        public string MedicacaoNome { get; set; } = string.Empty;
        public string VolumeDose { get; set; } = string.Empty;
        public string ViaAdministracao { get; set; } = string.Empty;
        public int QuantidadeDoses { get; set; }
        public int IntervaloEntreDosesHoras { get; set; }
        public DateTime DataHoraInicio { get; set; }
        public string Observacao { get; set; } = string.Empty;
        public string? Responsavel { get; set; }
    }
}