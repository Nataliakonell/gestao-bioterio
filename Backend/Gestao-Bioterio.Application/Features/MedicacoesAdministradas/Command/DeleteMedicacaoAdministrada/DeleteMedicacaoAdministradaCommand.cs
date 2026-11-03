using MediatR;

namespace Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Command.DeleteMedicacaoAdministrada
{
    public class DeleteMedicacaoAdministradaCommand : IRequest
    {
        public int Id { get; set; }
    }
}