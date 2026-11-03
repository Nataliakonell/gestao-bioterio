using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Medicacoes.Queries.GetAllMedicacoes
{
    public class GetAllMedicacoesQueryHandler(IMapper mapper, IMedicacaoRepository medicacaoRepository)
        : IRequestHandler<GetAllMedicacoesQuery, List<MedicacaoListVm>>
    {
        public async Task<List<MedicacaoListVm>> Handle(GetAllMedicacoesQuery request, CancellationToken cancellationToken)
        {
            var medicacoes = await medicacaoRepository.ListAllAsync();
            return mapper.Map<List<MedicacaoListVm>>(medicacoes);
        }
    }
}