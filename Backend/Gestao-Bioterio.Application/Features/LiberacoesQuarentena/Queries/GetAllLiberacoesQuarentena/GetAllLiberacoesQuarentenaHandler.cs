using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Queries.GetAllLiberacoesQuarentena
{
    public class GetAllLiberacoesQuarentenaHandler(
        IMapper mapper,
        ILiberacaoQuarentenaRepository repository) : IRequestHandler<GetAllLiberacoesQuarentenaQuery, List<LiberacaoQuarentenaListVm>>
    {
        public async Task<List<LiberacaoQuarentenaListVm>> Handle(GetAllLiberacoesQuarentenaQuery request, CancellationToken cancellationToken)
        {
            var entities = await repository.GetAllByAnimalIdAsync(request.AnimalId);
            return mapper.Map<List<LiberacaoQuarentenaListVm>>(entities);
        }
    }
}
