using MediatR;

namespace Gestao_Bioterio.Application.Features.Consultas.Queries.GetVisaoGeralClinica
{
    public class GetVisaoGeralClinicaQuery : IRequest<VisaoGeralClinicaResponse>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Search { get; set; }
        public int? EspecieId { get; set; }
        public string? TipoAtendimento { get; set; }
        public DateTime? DataInicio { get; set; }
        public DateTime? DataFim { get; set; }
    }
}
