using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Command.CreateMedicacaoAdministrada
{
    public class CreateMedicacaoAdministradaCommand : IRequest<CreateMedicacaoAdministradaResponse>
    {
        public int PrescricaoMedicacaoId { get; set; }
        public DateTime? DataHoraAdministracao { get; set; }
        public DateTime DataHoraPrevista { get; set; }
        public string? Observacao { get; set; }
        public string Responsavel { get; set; } = string.Empty;
        public StatusDose StatusDose { get; set; }
    }
}