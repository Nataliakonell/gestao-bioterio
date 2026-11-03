using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.AltaAmbulatorial.Queries.GetAllAltasAmbulatoriais
{
    public class GetAllAltasAmbulatoriaisHandler(
        IMapper mapper,
        IAltaAmbulatoriaRepository repository) : IRequestHandler<GetAllAltasAmbulatoriaisQuery, List<AltaAmbulatoriaListVm>>
    {
        public async Task<List<AltaAmbulatoriaListVm>> Handle(GetAllAltasAmbulatoriaisQuery request, CancellationToken cancellationToken)
        {
            var entities = await repository.GetAllByAnimalIdAsync(request.AnimalId);
            return mapper.Map<List<AltaAmbulatoriaListVm>>(entities);
        }
    }
}
