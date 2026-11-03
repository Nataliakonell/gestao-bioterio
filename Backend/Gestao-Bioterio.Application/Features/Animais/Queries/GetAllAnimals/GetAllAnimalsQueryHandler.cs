using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Animais.Queries.GetAllAnimals
{

    public class GetAllAnimalsQueryHandler(IMapper mapper, IAnimalRepository animalRepository)
        : IRequestHandler<GetAllAnimalsQuery, PaginatedAnimalListVm>
    {
        public async Task<PaginatedAnimalListVm> Handle(GetAllAnimalsQuery request, CancellationToken cancellationToken)
        {
            var totalCount = await animalRepository.GetAnimalsCountAsync(
                especieId: request.EspecieId,
                localizacaoId: request.InstalacaoBioterioId,
                genero: request.Genero,
                situacao: request.SituacaoAnimal,
                searchTerm: request.NumeroRegistro,
                faseDeVida: request.FaseDeVida);

            var animais = await animalRepository.GetAnimalsListAsync(
                especieId: request.EspecieId,
                localizacaoId: request.InstalacaoBioterioId,
                genero: request.Genero,
                situacao: request.SituacaoAnimal,
                searchTerm: request.NumeroRegistro,
                faseDeVida: request.FaseDeVida,
                page: request.Page,
                pageSize: request.PageSize);

            return new PaginatedAnimalListVm
            {
                Items = mapper.Map<List<AnimalListVm>>(animais),
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
    }
}
