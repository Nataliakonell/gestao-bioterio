using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.LocaisOrigem.Queries.GetLocalOrigemDetail
{
    public class GetLocalOrigemDetailQueryHandler(IMapper mapper, ILocalOrigemRepository localOrigemRepository) 
        : IRequestHandler<GetLocalOrigemDetailQuery, LocalOrigemDetailVm>
    {
        public async Task<LocalOrigemDetailVm> Handle(GetLocalOrigemDetailQuery request, CancellationToken cancellationToken)
        {
            var localOrigem = await localOrigemRepository.GetByIdAsync(request.Id);
            return mapper.Map<LocalOrigemDetailVm>(localOrigem);
        }
    }
}
