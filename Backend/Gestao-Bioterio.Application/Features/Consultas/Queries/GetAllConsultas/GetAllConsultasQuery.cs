using MediatR;

namespace Gestao_Bioterio.Application.Features.Consultas.Queries.GetAllConsultas
{
    public class GetAllConsultasQuery : IRequest<List<ConsultaListVm>>
    {
        public int? AnimalId { get; set; }
    }
}
