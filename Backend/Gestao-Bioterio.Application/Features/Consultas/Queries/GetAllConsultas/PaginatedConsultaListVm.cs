namespace Gestao_Bioterio.Application.Features.Consultas.Queries.GetAllConsultas
{
    public class PaginatedConsultaListVm
    {
        public List<ConsultaListVm> Items { get; set; } = [];
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
    }
}
