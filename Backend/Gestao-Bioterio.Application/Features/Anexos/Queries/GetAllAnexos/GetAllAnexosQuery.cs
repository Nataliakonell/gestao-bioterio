using MediatR;

namespace Gestao_Bioterio.Application.Features.Anexos.Queries.GetAllAnexos
{
    public class GetAllAnexosQuery : IRequest<List<AnexoListVm>>
    {
        public int? AnimalId { get; set; }
    }
}