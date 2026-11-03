using MediatR;

namespace Gestao_Bioterio.Application.Features.RegistrosObito.Queries.GetRegistroObitoDetail
{
    public class GetRegistroObitoDetailQuery : IRequest<RegistroObitoDetailVm?>
    {
        public int? Id { get; set; }
        public int? AnimalId { get; set; }
    }
}
