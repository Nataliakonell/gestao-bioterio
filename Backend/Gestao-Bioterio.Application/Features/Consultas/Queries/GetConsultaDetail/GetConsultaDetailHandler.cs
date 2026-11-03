using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Consultas.Queries.GetConsultaDetail
{
    public class GetConsultaDetailHandler(
        IMapper mapper,
        IConsultaRepository repository) : IRequestHandler<GetConsultaDetailQuery, ConsultaDetailVm?>
    {
        public async Task<ConsultaDetailVm?> Handle(GetConsultaDetailQuery request, CancellationToken cancellationToken)
        {
            var entity = await repository.GetByIdAsync(request.Id);
            if (entity == null) return null;
            return mapper.Map<ConsultaDetailVm>(entity);
        }
    }
}
