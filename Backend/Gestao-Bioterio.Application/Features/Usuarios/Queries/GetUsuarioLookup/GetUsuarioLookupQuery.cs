using MediatR;

namespace Gestao_Bioterio.Application.Features.Usuarios.Queries.GetUsuarioLookup
{
    public class GetUsuarioLookupQuery : IRequest<List<UsuarioLookupVm>>
    {
    }
}
