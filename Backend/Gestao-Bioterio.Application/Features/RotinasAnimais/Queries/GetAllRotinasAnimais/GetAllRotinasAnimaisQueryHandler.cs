using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAllRotinasAnimais
{
    public class GetAllRotinasAnimaisQueryHandler : IRequestHandler<GetAllRotinasAnimaisQuery, PaginatedRotinaAnimalListVm>
    {
        private readonly IRotinaAnimalRepository _rotinaAnimalRepository;
        private readonly IMapper _mapper;

        public GetAllRotinasAnimaisQueryHandler(IMapper mapper, IRotinaAnimalRepository rotinaAnimalRepository)
        {
            _mapper = mapper;
            _rotinaAnimalRepository = rotinaAnimalRepository;
        }

        public async Task<PaginatedRotinaAnimalListVm> Handle(GetAllRotinasAnimaisQuery request, CancellationToken cancellationToken)
        {
            var count = await _rotinaAnimalRepository.GetRotinasAnimaisCountAsync(request.SearchTerm, request.EspecieId, request.FaseDeVidas);
            var rotinasAnimais = await _rotinaAnimalRepository.GetRotinasAnimaisListPaginatedAsync(request.SearchTerm, request.Page, request.PageSize, request.EspecieId, request.FaseDeVidas);
            
            return new PaginatedRotinaAnimalListVm
            {
                Items = _mapper.Map<List<RotinaAnimalListVm>>(rotinasAnimais),
                TotalCount = count,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
    }
}
