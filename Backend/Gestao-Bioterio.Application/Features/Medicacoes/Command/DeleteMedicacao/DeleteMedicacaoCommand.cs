using MediatR;

namespace Gestao_Bioterio.Application.Features.Medicacoes.Command.DeleteMedicacao
{
    public class DeleteMedicacaoCommand : IRequest
    {
        public int Id { get; set; }
    }
}