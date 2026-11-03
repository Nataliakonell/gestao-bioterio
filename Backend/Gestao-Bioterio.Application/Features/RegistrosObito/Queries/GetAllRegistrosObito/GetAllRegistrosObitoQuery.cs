using MediatR;

namespace Gestao_Bioterio.Application.Features.RegistrosObito.Queries.GetAllRegistrosObito
{
    public class GetAllRegistrosObitoQuery : IRequest<List<RegistroObitoListVm>>
    {
        public int? AnimalId { get; set; }
    }
}
