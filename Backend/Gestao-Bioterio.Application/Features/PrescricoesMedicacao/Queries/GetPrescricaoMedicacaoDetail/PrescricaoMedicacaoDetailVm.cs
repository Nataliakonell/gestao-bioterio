namespace Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Queries.GetPrescricaoMedicacaoDetail
{
    public class PrescricaoMedicacaoDetailVm
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
        public string Status { get; set; } = string.Empty;
        public DateTime? DataHoraSuspensao { get; set; }
        public string? MotivoSuspensao { get; set; }
        public string RF { get; set; } = string.Empty;
        public List<AdministracaoVm> Administracoes { get; set; } = [];
        public string? Responsavel { get; set; }
    }

    public class AdministracaoVm
    {
        public int Id { get; set; }
        public DateTime DataHoraPrevista { get; set; }
        public DateTime? DataHoraAdministracao { get; set; }
        public string StatusDose { get; set; } = string.Empty;
        public string Observacao { get; set; } = string.Empty;
        public string Responsavel { get; set; } = string.Empty;
    }
}