using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Consultas.Queries.GetAllConsultas
{
    public class GetAllConsultasHandler(
        IMapper mapper,
        IConsultaRepository repository) : IRequestHandler<GetAllConsultasQuery, List<ConsultaListVm>>
    {
        public async Task<List<ConsultaListVm>> Handle(GetAllConsultasQuery request, CancellationToken cancellationToken)
        {
            List<Consulta> list;
            if (request.AnimalId.HasValue && request.AnimalId.Value > 0)
            {
                list = await repository.GetConsultasByAnimalAsync(request.AnimalId.Value);
            }
            else
            {
                list = (await repository.ListAllAsync()).ToList();
            }
            return mapper.Map<List<ConsultaListVm>>(list);
        }
    }
}
