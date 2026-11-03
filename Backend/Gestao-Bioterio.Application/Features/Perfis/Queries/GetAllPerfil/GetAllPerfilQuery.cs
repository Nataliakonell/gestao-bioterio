using MediatR;

namespace Gestao_Bioterio.Application.Features.Perfis.Queries.GetAllPerfil
{
    public class GetAllPerfilQuery : IRequest<List<PerfilListVm>>
    {
    }
}
