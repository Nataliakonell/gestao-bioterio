using MediatR;

namespace Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.DeletePrescricaoMedicacao
{
    public class DeletePrescricaoMedicacaoCommand : IRequest
    {
        public int Id { get; set; }
    }
}