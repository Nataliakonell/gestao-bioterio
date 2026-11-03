using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Localizacoes.Queries.GetLocalizacaoDetail
{
    public class GetLocalizacaoDetailHandler(
        IMapper mapper,
        ILocalizacaoRepository localizacaoRepository,
        IAnimalLocalizacaoRepository animalLocalizacaoRepository,
        IAnimalRepository animalRepository
    ) : IRequestHandler<GetLocalizacaoDetailQuery, LocalizacaoDetailVm?>
    {
        public async Task<LocalizacaoDetailVm?> Handle(GetLocalizacaoDetailQuery request, CancellationToken cancellationToken)
        {
            var localizacao = await localizacaoRepository.GetByIdAsync(request.Id);
            if (localizacao == null)
                return null;

            var vm = mapper.Map<LocalizacaoDetailVm>(localizacao);
            var todosVinculos = await animalLocalizacaoRepository.ListAllAsync();
            var animais = await animalRepository.ListAllAsync();

            var animalToLoc = new Dictionary<int, int>();
            foreach (var al in todosVinculos)
            {
                animalToLoc[al.AnimalId] = al.LocalizacaoId;
            }

            int count = 0;
            foreach (var animal in animais)
            {
                if (animalToLoc.TryGetValue(animal.Id, out var locId))
                {
                    if (locId == request.Id) count++;
                }
                else if (animal.InstalacaoBioterioId == request.Id)
                {
                    count++;
                }
            }

            vm.QuantidadeAnimais = count;
            return vm;
        }
    }
}
