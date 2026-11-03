using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.RegistrosObito.Queries.GetRegistroObitoDetail
{
    public class GetRegistroObitoDetailHandler(
        IMapper mapper,
        IRegistroObitoRepository repository)
        : IRequestHandler<GetRegistroObitoDetailQuery, RegistroObitoDetailVm?>
    {
        public async Task<RegistroObitoDetailVm?> Handle(GetRegistroObitoDetailQuery request, CancellationToken cancellationToken)
        {
            if (request.Id.HasValue && request.Id.Value > 0)
            {
                var entity = await repository.GetByIdAsync(request.Id.Value);
                return mapper.Map<RegistroObitoDetailVm>(entity);
            }

            if (request.AnimalId.HasValue && request.AnimalId.Value > 0)
            {
                var entity = await repository.GetByAnimalIdAsync(request.AnimalId.Value);
                return mapper.Map<RegistroObitoDetailVm>(entity);
            }

            return null;
        }
    }
}
