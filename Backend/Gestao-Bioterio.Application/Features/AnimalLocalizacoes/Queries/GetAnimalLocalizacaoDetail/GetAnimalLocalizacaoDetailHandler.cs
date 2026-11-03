using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Queries.GetAnimalLocalizacaoDetail
{
    public class GetAnimalLocalizacaoDetailHandler(
        IMapper mapper,
        IAnimalLocalizacaoRepository animalLocalizacaoRepository,
        IAnimalRepository animalRepository,
        ILocalizacaoRepository localizacaoRepository
    ) : IRequestHandler<GetAnimalLocalizacaoDetailQuery, AnimalLocalizacaoDetailVm?>
    {
        public async Task<AnimalLocalizacaoDetailVm?> Handle(GetAnimalLocalizacaoDetailQuery request, CancellationToken cancellationToken)
        {
            var entity = await animalLocalizacaoRepository.GetByIdAsync(request.Id);
            if (entity == null)
                return null;

            var animal = await animalRepository.GetByIdAsync(entity.AnimalId);
            var localizacao = await localizacaoRepository.GetByIdAsync(entity.LocalizacaoId);

            var vm = mapper.Map<AnimalLocalizacaoDetailVm>(entity);
            if (animal != null)
            {
                vm.AnimalNomePopular = animal.NomePopular;
                vm.AnimalNumeroRegistro = animal.NumeroRegistro;
            }
            if (localizacao != null)
            {
                vm.LocalizacaoNome = localizacao.Nome;
                vm.LocalizacaoCaminhoHierarquia = localizacao.CaminhoHierarquia;
            }

            return vm;
        }
    }
}
