using MediatR;

namespace Gestao_Bioterio.Application.Features.Procedimentos.Queries.GetProcedimentoDetail
{
    public class GetProcedimentoDetailQuery : IRequest<ProcedimentoDetailVm>
    {
        public int Id { get; set; }
    }
}