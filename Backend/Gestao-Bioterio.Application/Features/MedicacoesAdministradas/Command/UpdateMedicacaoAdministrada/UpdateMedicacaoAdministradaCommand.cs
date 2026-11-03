using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Command.UpdateMedicacaoAdministrada
{
    public class UpdateMedicacaoAdministradaCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public int PrescricaoMedicacaoId { get; set; }
        public DateTime? DataHoraAdministracao { get; set; }
        public DateTime DataHoraPrevista { get; set; }
        public string? Observacao { get; set; }
        public string Responsavel { get; set; } = string.Empty;
        public StatusDose StatusDose { get; set; }
    }
}