using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAllAlimentacoes;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAllAlimentacao
{
    public class GetAllAlimentacaoQuery : IRequest<PaginatedAlimentacaoListVm> 
    {
        public int? AnimalId { get; set; }
        public string? SearchTerm { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public int? EspecieId { get; set; }
        public List<int>? FaseDeVida { get; set; }
        public List<int>? Status { get; set; }
        public DateTime? DataInicial { get; set; }
        public DateTime? DataFinal { get; set; }
    }
}
