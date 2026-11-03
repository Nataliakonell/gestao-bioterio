using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.AltaAmbulatorial.Queries.GetAltaAmbulatorial
{
    public class GetAltaAmbulatoriaHandler(
        IMapper mapper,
        IAltaAmbulatoriaRepository repository)
        : IRequestHandler<GetAltaAmbulatoriaQuery, AltaAmbulatoriaDetailVm?>
    {
        public async Task<AltaAmbulatoriaDetailVm?> Handle(GetAltaAmbulatoriaQuery request, CancellationToken cancellationToken)
        {
            if (request.Id.HasValue && request.Id.Value > 0)
            {
                var entityById = await repository.GetByIdWithDetailsAsync(request.Id.Value);
                return mapper.Map<AltaAmbulatoriaDetailVm>(entityById);
            }

            if (request.AnimalId.HasValue && request.AnimalId.Value > 0)
            {
                var entityByAnimal = await repository.GetByAnimalIdAsync(request.AnimalId.Value);
                return mapper.Map<AltaAmbulatoriaDetailVm>(entityByAnimal);
            }

            return null;
        }
    }
}
