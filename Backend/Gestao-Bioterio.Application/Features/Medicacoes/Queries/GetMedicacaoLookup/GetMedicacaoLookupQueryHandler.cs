using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Medicacoes.Queries.GetMedicacaoLookup
{
    public class GetMedicacaoLookupQueryHandler(IMedicacaoRepository medicacaoRepository)
        : IRequestHandler<GetMedicacaoLookupQuery, List<MedicacaoLookupVm>>
    {
        public async Task<List<MedicacaoLookupVm>> Handle(GetMedicacaoLookupQuery request, CancellationToken cancellationToken)
        {
            var items = await medicacaoRepository.GetMedicacaoLookupAsync();
            return items.Select(x => new MedicacaoLookupVm { Id = x.Id, PrincipioAtivo = x.PrincipioAtivo, NomeComercial = x.NomeComercial }).ToList();
        }
    }
}