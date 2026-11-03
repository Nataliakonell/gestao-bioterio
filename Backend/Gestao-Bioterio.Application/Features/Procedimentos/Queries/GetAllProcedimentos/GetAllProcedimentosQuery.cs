using MediatR;

namespace Gestao_Bioterio.Application.Features.Procedimentos.Queries.GetAllProcedimentos
{
    public class GetAllProcedimentosQuery : IRequest<List<ProcedimentoListVm>>
    {
        public int? AnimalId { get; set; }
    }
}