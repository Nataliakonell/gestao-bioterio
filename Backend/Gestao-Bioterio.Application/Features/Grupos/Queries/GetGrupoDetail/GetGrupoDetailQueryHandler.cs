using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.Groups.Queries.GetGroupDetail;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Groups.Queries
{
    public class GetGroupDetailQueryHandler(IMapper mapper, IGrupoRepository groupRepository) : IRequestHandler<GetGroupDetailQuery, GroupDetailVm>
    {    
        public async Task<GroupDetailVm> Handle(GetGroupDetailQuery request, CancellationToken cancellationToken)
        {
            var group = await groupRepository.GetByIdAsync(request.Id);
            return mapper.Map<GroupDetailVm>(group);
        }
    }
}