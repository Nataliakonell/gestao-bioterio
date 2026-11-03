namespace Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Queries.GetAllPrescricoesMedicacao
{
    public class PrescricaoMedicacaoListVm
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
        public int TotalAdministracoes { get; set; }
        public int AdministracoesConcluidas { get; set; }
        public string RF { get; set; } = string.Empty;
        public string NomeProfissional { get; set; } = string.Empty;
        public DateTime DataCriacao { get; set; }
        public string? Responsavel { get; set; }
    }
}