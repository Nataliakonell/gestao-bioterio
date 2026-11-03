using MediatR;

namespace Gestao_Bioterio.Application.Features.LocaisOrigem.Queries.GetLocalOrigemDetail
{
    public class GetLocalOrigemDetailQuery : IRequest<LocalOrigemDetailVm>
    {
        public int Id { get; set; }
    }
}
