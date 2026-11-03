using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.EventosAnimais.Queries.GetEventoAnimalDetail
{
    public class GetEventoAnimalDetailHandler(
        IMapper mapper,
        IEventoAnimalRepository eventoAnimalRepository,
        IAnimalRepository animalRepository,
        IEspecieRepository especieRepository
    ) : IRequestHandler<GetEventoAnimalDetailQuery, EventoAnimalDetailVm?>
    {
        public async Task<EventoAnimalDetailVm?> Handle(GetEventoAnimalDetailQuery request, CancellationToken cancellationToken)
        {
            var entity = await eventoAnimalRepository.GetByIdAsync(request.Id);
            if (entity == null)
                return null;

            var animal = await animalRepository.GetByIdAsync(entity.AnimalId);

            var vm = mapper.Map<EventoAnimalDetailVm>(entity);
            if (animal != null)
            {
                vm.AnimalNomePopular = animal.NomePopular;
                vm.AnimalNumeroRegistro = animal.NumeroRegistro;
                var especie = await especieRepository.GetByIdAsync(animal.EspecieId);
                vm.AnimalEspecieNome = especie?.Nome;
            }

            return vm;
        }
    }
}
