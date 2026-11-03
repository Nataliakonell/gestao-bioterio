using MediatR;

namespace Gestao_Bioterio.Application.Features.Usuarios.Queries.GetAllUsuarios
{
    public class GetAllUsuarioQuery : IRequest<PaginatedUsuarioListVm>
    {
        public int UsuarioId { get; set; }
        public string? SearchTerm { get; set; }
        public bool? Status { get; set; }
        public int PageSize { get; set; }
        public int Page { get; set; }
    }
}
