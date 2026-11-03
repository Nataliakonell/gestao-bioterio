using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.UpdatePrescricaoMedicacao
{
    public class UpdatePrescricaoMedicacaoCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public int MedicacaoId { get; set; }
        public string VolumeDose { get; set; } = string.Empty;
        public ViaAdministracao ViaAdministracao { get; set; }
        public int QuantidadeDoses { get; set; }
        public int IntervaloEntreDosesHoras { get; set; }
        public DateTime DataHoraInicio { get; set; }
        public string? Observacao { get; set; }
        public string? Responsavel { get; set; }
    }
}