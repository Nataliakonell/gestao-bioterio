using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.BiometriaAnimais.Queries.GetAllBiometriaAnimal
{
    public class GetAllBiometriaAnimalHandler(IMapper mapper, IBiometriaAnimalRepository biometriaAnimalRepository)
            : IRequestHandler<GetAllRotinaAnimalQuery, PaginatedBiometriaAnimalListVm>
    {
        public async Task<PaginatedBiometriaAnimalListVm> Handle(GetAllRotinaAnimalQuery request, CancellationToken cancellationToken)
        {
            var count = await biometriaAnimalRepository.GetBiometriaCountAsync(request.AnimalId, request.SearchTerm, request.EspecieId, request.FaseDeVida);
            var biometriaAnimal = await biometriaAnimalRepository.GetBiometriaListPaginatedAsync(request.AnimalId, request.SearchTerm, request.EspecieId, request.FaseDeVida, request.Page, request.PageSize);

            return new PaginatedBiometriaAnimalListVm
            {
                Items = mapper.Map<List<BiometriaAnimalListVm>>(biometriaAnimal),
                TotalCount = count,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
    }
}
