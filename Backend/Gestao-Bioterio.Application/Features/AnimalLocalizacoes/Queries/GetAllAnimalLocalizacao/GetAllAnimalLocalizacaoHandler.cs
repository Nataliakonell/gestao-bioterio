using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Queries.GetAllAnimalLocalizacao
{
    public class GetAllAnimalLocalizacaoHandler(
        IMapper mapper,
        IAnimalLocalizacaoRepository animalLocalizacaoRepository,
        IAnimalRepository animalRepository,
        ILocalizacaoRepository localizacaoRepository,
        IEspecieRepository especieRepository
    ) : IRequestHandler<GetAllAnimalLocalizacaoQuery, List<AnimalLocalizacaoListVm>>
    {
        public async Task<List<AnimalLocalizacaoListVm>> Handle(GetAllAnimalLocalizacaoQuery request, CancellationToken cancellationToken)
        {
            var list = await animalLocalizacaoRepository.ListAllAsync();
            var animais = await animalRepository.ListAllAsync();
            var localizacoes = await localizacaoRepository.ListAllAsync();
            var especies = await especieRepository.ListAllAsync();

            var animalDict = animais.ToDictionary(a => a.Id);
            var localizacaoDict = localizacoes.ToDictionary(l => l.Id);
            var especieDict = especies.ToDictionary(e => e.Id);

            var vms = new List<AnimalLocalizacaoListVm>();
            foreach (var item in list)
            {
                var vm = mapper.Map<AnimalLocalizacaoListVm>(item);
                if (animalDict.TryGetValue(item.AnimalId, out var animal))
                {
                    vm.AnimalNomePopular = animal.NomePopular;
                    vm.AnimalNumeroRegistro = animal.NumeroRegistro;
                    vm.AnimalEspecieId = animal.EspecieId;
                    vm.AnimalGenero = animal.Genero;
                    vm.AnimalFaseDeVida = animal.FaseDeVida;

                    if (especieDict.TryGetValue(animal.EspecieId, out var esp))
                    {
                        vm.AnimalEspecieNome = esp.Nome;
                    }
                }
                if (localizacaoDict.TryGetValue(item.LocalizacaoId, out var loc))
                {
                    vm.LocalizacaoNome = loc.Nome;
                    vm.LocalizacaoCaminhoHierarquia = loc.CaminhoHierarquia;
                }
                vms.Add(vm);
            }

            return vms;
        }
    }
}
