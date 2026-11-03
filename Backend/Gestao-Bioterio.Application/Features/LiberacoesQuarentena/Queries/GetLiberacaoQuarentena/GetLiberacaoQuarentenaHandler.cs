using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Queries.GetLiberacaoQuarentena
{
    public class GetLiberacaoQuarentenaHandler(
        IMapper mapper,
        ILiberacaoQuarentenaRepository repository) : IRequestHandler<GetLiberacaoQuarentenaQuery, LiberacaoQuarentenaDetailVm?>
    {
        public async Task<LiberacaoQuarentenaDetailVm?> Handle(GetLiberacaoQuarentenaQuery request, CancellationToken cancellationToken)
        {
            if (request.Id.HasValue && request.Id.Value > 0)
            {
                var entity = await repository.GetByIdAsync(request.Id.Value);
                return mapper.Map<LiberacaoQuarentenaDetailVm>(entity);
            }

            if (request.AnimalId.HasValue && request.AnimalId.Value > 0)
            {
                var entity = await repository.GetByAnimalIdAsync(request.AnimalId.Value);
                return mapper.Map<LiberacaoQuarentenaDetailVm>(entity);
            }

            return null;
        }
    }
}
