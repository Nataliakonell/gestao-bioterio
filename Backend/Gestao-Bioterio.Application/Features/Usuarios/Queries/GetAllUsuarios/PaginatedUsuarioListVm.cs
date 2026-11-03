using Gestao_Bioterio.Application.Features.SolicitacoesExame.Queries.GetAllSolicitacoesExame;

namespace Gestao_Bioterio.Application.Features.Usuarios.Queries.GetAllUsuarios
{
    public class PaginatedUsuarioListVm
    {
        public List<UsuarioListVm> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
    }
}
