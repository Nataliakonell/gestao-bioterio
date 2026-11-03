using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Queries.GetAllMovimentacaoAnimal
{
    public class GetAllMovimentacaoAnimalHandler(
        IMapper mapper,
        IMovimentacaoAnimalRepository movimentacaoAnimalRepository,
        IAnimalRepository animalRepository,
        ILocalizacaoRepository localizacaoRepository
    ) : IRequestHandler<GetAllMovimentacaoAnimalQuery, List<MovimentacaoAnimalListVm>>
    {
        public async Task<List<MovimentacaoAnimalListVm>> Handle(GetAllMovimentacaoAnimalQuery request, CancellationToken cancellationToken)
        {
            List<MovimentacaoAnimal> movimentacoes;
            if (request.AnimalId.HasValue && request.AnimalId.Value > 0)
            {
                movimentacoes = await movimentacaoAnimalRepository.ObterHistoricoPorAnimalIdAsync(request.AnimalId.Value);
            }
            else
            {
                var list = await movimentacaoAnimalRepository.ListAllAsync();
                movimentacoes = list.ToList();
            }

            var animais = await animalRepository.ListAllAsync();
            var localizacoes = await localizacaoRepository.ListAllAsync();

            var animalDict = animais.ToDictionary(a => a.Id);
            var localizacaoDict = localizacoes.ToDictionary(l => l.Id);

            var vms = new List<MovimentacaoAnimalListVm>();
            foreach (var item in movimentacoes.OrderByDescending(x => x.DataCriacao))
            {
                var vm = mapper.Map<MovimentacaoAnimalListVm>(item);
                if (animalDict.TryGetValue(item.AnimalId, out var a))
                {
                    vm.AnimalNomePopular = a.NomePopular;
                    vm.AnimalNumeroRegistro = a.NumeroRegistro;
                }
                if (localizacaoDict.TryGetValue(item.LocalizacaoId, out var l))
                {
                    vm.LocalizacaoNome = l.Nome;
                    vm.LocalizacaoCaminhoHierarquia = l.CaminhoHierarquia;
                }
                vms.Add(vm);
            }

            return vms;
        }
    }
}
