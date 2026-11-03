using MediatR;

namespace Gestao_Bioterio.Application.Features.AltaAmbulatorial.Queries.GetAltaAmbulatorial
{
    public class GetAltaAmbulatoriaQuery : IRequest<AltaAmbulatoriaDetailVm?>
    {
        public int? Id { get; set; }
        public int? AnimalId { get; set; }

        public GetAltaAmbulatoriaQuery()
        {
        }

        public GetAltaAmbulatoriaQuery(int animalId)
        {
            AnimalId = animalId;
        }
    }
}
