using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Localizacoes.Queries.GetAllLocalizacao
{
    public class GetAllLocalizacaoHandler(
        IMapper mapper,
        ILocalizacaoRepository localizacaoRepository,
        IAnimalLocalizacaoRepository animalLocalizacaoRepository,
        IAnimalRepository animalRepository
    ) : IRequestHandler<GetAllLocalizacaoQuery, List<LocalizacaoListVm>>
    {
        public async Task<List<LocalizacaoListVm>> Handle(GetAllLocalizacaoQuery request, CancellationToken cancellationToken)
        {
            var localizacoes = await localizacaoRepository.ListAllAsync();
            var animaisLocalizados = await animalLocalizacaoRepository.ListAllAsync();
            var animais = await animalRepository.ListAllAsync();

            // Mapeia animalId -> localizacaoId
            var animalToLoc = new Dictionary<int, int>();
            foreach (var al in animaisLocalizados)
            {
                animalToLoc[al.AnimalId] = al.LocalizacaoId;
            }

            // Conta animais por localização, considerando tanto AnimalLocalizacao quanto fallback em InstalacaoBioterioId legado
            var contagemPorLocalizacao = new Dictionary<int, int>();
            foreach (var animal in animais)
            {
                int locId;
                if (animalToLoc.TryGetValue(animal.Id, out var directLocId))
                {
                    locId = directLocId;
                }
                else if (animal.InstalacaoBioterioId > 0)
                {
                    locId = animal.InstalacaoBioterioId;
                }
                else
                {
                    continue;
                }

                contagemPorLocalizacao[locId] = contagemPorLocalizacao.GetValueOrDefault(locId, 0) + 1;
            }

            var vms = mapper.Map<List<LocalizacaoListVm>>(localizacoes);
            foreach (var vm in vms)
            {
                vm.QuantidadeAnimais = contagemPorLocalizacao.GetValueOrDefault(vm.Id, 0);
            }

            return vms;
        }
    }
}
