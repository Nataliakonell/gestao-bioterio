using MediatR;

namespace Gestao_Bioterio.Application.Features.Perfis.Queries.GetPerfilDetail
{
    public class GetPerfilDetailQuery : IRequest<PerfilDetailVm>
    {
        public int Id { get; set; }
    }
}
