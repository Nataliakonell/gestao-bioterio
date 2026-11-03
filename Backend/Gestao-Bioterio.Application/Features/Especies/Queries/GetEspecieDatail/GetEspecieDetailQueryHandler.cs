using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Especies.Queries.GetEspecieDatail
{
    public class GetEspecieDetailQueryHandler(IMapper mapper, IEspecieRepository specieRepository) : IRequestHandler<GetEspecieDetailQuery, SpecieDetailVm>
    {    
        public async Task<SpecieDetailVm> Handle(GetEspecieDetailQuery request, CancellationToken cancellationToken)
        {
            var specie = await specieRepository.GetByIdAsync(request.Id);
            return mapper.Map<SpecieDetailVm>(specie);
        }
    }
}