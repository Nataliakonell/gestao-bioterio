using MediatR;

namespace Gestao_Bioterio.Application.Features.Especies.Queries.GetEspecieDatail
{
    public class GetEspecieDetailQuery: IRequest<SpecieDetailVm>
    {
        public int Id { get; set; }
    }
}