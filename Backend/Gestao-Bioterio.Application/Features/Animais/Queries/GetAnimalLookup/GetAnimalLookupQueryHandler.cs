using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Animais.Queries.GetAnimalLookup
{
    public class GetAnimalLookupQueryHandler(IAnimalRepository animalRepository)
        : IRequestHandler<GetAnimalLookupQuery, List<AnimalLookupVm>>
    {
        public async Task<List<AnimalLookupVm>> Handle(GetAnimalLookupQuery request, CancellationToken cancellationToken)
        {
            var items = await animalRepository.GetAnimalLookupAsync();
            return items.Select(x => new AnimalLookupVm
            {
                Id = x.Id,
                NumeroRegistro = x.NumeroRegistro,
                EspecieNome = x.EspecieNome,
                Peso = x.Peso
            }).ToList();
        }
    }
}
