using Gestao_Bioterio.Application.Features.Groups.Queries.GetGroupDetail;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Groups.Queries
{
    public class GetGroupDetailQuery: IRequest<GroupDetailVm>
    {
        public int Id { get; set; }
    }
}