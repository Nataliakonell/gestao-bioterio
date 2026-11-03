using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Queries.GetMovimentacaoAnimalDetail
{
    public class GetMovimentacaoAnimalDetailHandler(
        IMapper mapper,
        IMovimentacaoAnimalRepository movimentacaoAnimalRepository,
        IAnimalRepository animalRepository,
        ILocalizacaoRepository localizacaoRepository
    ) : IRequestHandler<GetMovimentacaoAnimalDetailQuery, MovimentacaoAnimalDetailVm?>
    {
        public async Task<MovimentacaoAnimalDetailVm?> Handle(GetMovimentacaoAnimalDetailQuery request, CancellationToken cancellationToken)
        {
            var entity = await movimentacaoAnimalRepository.GetByIdAsync(request.Id);
            if (entity == null)
                return null;

            var animal = await animalRepository.GetByIdAsync(entity.AnimalId);
            var localizacao = await localizacaoRepository.GetByIdAsync(entity.LocalizacaoId);

            var vm = mapper.Map<MovimentacaoAnimalDetailVm>(entity);
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
