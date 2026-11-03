using MediatR;

namespace Gestao_Bioterio.Application.Features.Funcionalidades.Queries.GetFuncionalidadeDetail
{
    public class GetFuncionalidadeDetailQuery : IRequest<FuncionalidadeDetailVm>
    {
        public int Id { get; set; }
    }
}
