using MediatR;

namespace Gestao_Bioterio.Application.Features.AltaAmbulatorial.Queries.GetAllAltasAmbulatoriais
{
    public class GetAllAltasAmbulatoriaisQuery : IRequest<List<AltaAmbulatoriaListVm>>
    {
        public int? AnimalId { get; set; }
    }
}
