using MediatR;

namespace Gestao_Bioterio.Application.Features.Funcionalidades.Queries.GetAllFuncionalidade
{
    public class GetAllFuncionalidadeQuery : IRequest<List<FuncionalidadeListVm>>
    {
    }
}
