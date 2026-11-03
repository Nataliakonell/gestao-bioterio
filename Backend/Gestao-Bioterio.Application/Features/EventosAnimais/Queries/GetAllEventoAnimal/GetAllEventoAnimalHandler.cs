using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.EventosAnimais.Queries.GetAllEventoAnimal
{
    public class GetAllEventoAnimalHandler(
        IMapper mapper,
        IEventoAnimalRepository eventoAnimalRepository,
        IAnimalRepository animalRepository,
        IEspecieRepository especieRepository
    ) : IRequestHandler<GetAllEventoAnimalQuery, List<EventoAnimalListVm>>
    {
        public async Task<List<EventoAnimalListVm>> Handle(GetAllEventoAnimalQuery request, CancellationToken cancellationToken)
        {
            List<EventoAnimal> list;
            if (request.EventoId.HasValue && request.EventoId.Value > 0)
            {
                list = await eventoAnimalRepository.ObterPorEventoIdAsync(request.EventoId.Value);
            }
            else
            {
                var all = await eventoAnimalRepository.ListAllAsync();
                list = all.ToList();
            }

            var animais = await animalRepository.ListAllAsync();
            var animalDict = animais.ToDictionary(a => a.Id);

            var especies = await especieRepository.ListAllAsync();
            var especieDict = especies.ToDictionary(e => e.Id, e => e.Nome);

            var vms = new List<EventoAnimalListVm>();
            foreach (var item in list)
            {
                var vm = mapper.Map<EventoAnimalListVm>(item);
                if (animalDict.TryGetValue(item.AnimalId, out var a))
                {
                    vm.AnimalNomePopular = a.NomePopular;
                    vm.AnimalNumeroRegistro = a.NumeroRegistro;
                    if (especieDict.TryGetValue(a.EspecieId, out var espNome))
                    {
                        vm.AnimalEspecieNome = espNome;
                    }
                }
                vms.Add(vm);
            }

            return vms;
        }
    }
}
