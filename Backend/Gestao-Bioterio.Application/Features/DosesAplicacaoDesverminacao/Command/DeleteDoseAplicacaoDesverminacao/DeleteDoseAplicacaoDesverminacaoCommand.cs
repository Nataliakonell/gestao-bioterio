using MediatR;

namespace Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Command.DeleteDoseAplicacaoDesverminacao
{
    public class DeleteDoseAplicacaoDesverminacaoCommand : IRequest
    {
        public int Id { get; set; }
    }
}