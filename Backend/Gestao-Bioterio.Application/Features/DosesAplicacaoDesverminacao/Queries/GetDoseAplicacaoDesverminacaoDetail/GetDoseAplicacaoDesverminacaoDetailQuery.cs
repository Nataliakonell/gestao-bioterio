using MediatR;

namespace Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Queries.GetDoseAplicacaoDesverminacaoDetail
{
    public class GetDoseAplicacaoDesverminacaoDetailQuery : IRequest<DoseAplicacaoDesverminacaoDetailVm>
    {
        public int Id { get; set; }
    }
}