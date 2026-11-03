using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.RegistrosObito.Queries.GetAllRegistrosObito
{
    public class GetAllRegistrosObitoHandler(
        IMapper mapper,
        IRegistroObitoRepository repository)
        : IRequestHandler<GetAllRegistrosObitoQuery, List<RegistroObitoListVm>>
    {
        public async Task<List<RegistroObitoListVm>> Handle(GetAllRegistrosObitoQuery request, CancellationToken cancellationToken)
        {
            var list = await repository.GetAllByAnimalIdAsync(request.AnimalId);
            return mapper.Map<List<RegistroObitoListVm>>(list);
        }
    }
}
