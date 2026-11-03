using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAllAlimentacoes;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAllAlimentacao
{
    public class GetAllAlimentacaoHandler(IMapper mapper, IAlimentacaoRepository alimentacaoRepository)
        : IRequestHandler<GetAllAlimentacaoQuery, PaginatedAlimentacaoListVm>
    {
        public async Task<PaginatedAlimentacaoListVm> Handle(GetAllAlimentacaoQuery request, CancellationToken cancellationToken)
        {
            var count = await alimentacaoRepository.GetAlimentacoesCountAsync(request.AnimalId, request.SearchTerm, request.EspecieId, request.FaseDeVida, request.Status, request.DataInicial, request.DataFinal);
            var alimentacoes = await alimentacaoRepository.GetAlimentacoesListPaginatedAsync(request.AnimalId, request.SearchTerm, request.EspecieId, request.FaseDeVida, request.Status, request.Page, request.PageSize, request.DataInicial, request.DataFinal);

            return new PaginatedAlimentacaoListVm
            {
                Items = mapper.Map<List<AlimentacaoListVm>>(alimentacoes),
                TotalCount = count,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
    }
}