using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Anexos.Queries.GetAllAnexos
{
    public class GetAllAnexosHandler(
        IMapper mapper,
        IAnexoRepository anexoRepository
    ) : IRequestHandler<GetAllAnexosQuery, List<AnexoListVm>>
    {
        public async Task<List<AnexoListVm>> Handle(GetAllAnexosQuery request, CancellationToken cancellationToken)
        {
            List<Anexo> anexos;

            if (request.AnimalId.HasValue)
                anexos = await anexoRepository.GetAnexosByAnimalAsync(request.AnimalId.Value);
            else
                anexos = (await anexoRepository.ListAllAsync()).ToList();

            return mapper.Map<List<AnexoListVm>>(anexos);
        }
    }
}