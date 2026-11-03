using MediatR;

namespace Gestao_Bioterio.Application.Features.Usuarios.Queries.GetMyPermissoes
{
    public class GetMyPermissoesQuery : IRequest<MyPermissoesVm>
    {
        public string RF { get; set; } = string.Empty;
        public bool IsAdmin { get; set; }
    }
}
