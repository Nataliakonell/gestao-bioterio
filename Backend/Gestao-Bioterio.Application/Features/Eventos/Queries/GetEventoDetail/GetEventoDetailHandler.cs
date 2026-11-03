using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Eventos.Queries.GetEventoDetail
{
    public class GetEventoDetailHandler(
        IMapper mapper,
        IEventoRepository eventoRepository,
        IEventoAnimalRepository eventoAnimalRepository,
        IAnimalRepository animalRepository,
        IEspecieRepository especieRepository
    ) : IRequestHandler<GetEventoDetailQuery, EventoDetailVm?>
    {
        public async Task<EventoDetailVm?> Handle(GetEventoDetailQuery request, CancellationToken cancellationToken)
        {
            var entity = await eventoRepository.GetByIdAsync(request.Id);
            if (entity == null)
                return null;

            var vinculosAnimais = await eventoAnimalRepository.ObterPorEventoIdAsync(entity.Id);

            var vm = mapper.Map<EventoDetailVm>(entity);

            var especies = await especieRepository.ListAllAsync();
            var especieDict = especies.ToDictionary(e => e.Id, e => e.Nome);

            foreach (var vinculo in vinculosAnimais)
            {
                var animal = await animalRepository.GetByIdAsync(vinculo.AnimalId);
                string? especieNome = null;
                if (animal != null && especieDict.TryGetValue(animal.EspecieId, out var nomeEsp))
                {
                    especieNome = nomeEsp;
                }

                vm.Animais.Add(new EventoAnimalItemVm
                {
                    Id = vinculo.Id,
                    AnimalId = vinculo.AnimalId,
                    AnimalNomePopular = animal?.NomePopular,
                    AnimalNumeroRegistro = animal?.NumeroRegistro,
                    AnimalEspecieNome = especieNome
                });
            }

            return vm;
        }
    }
}
