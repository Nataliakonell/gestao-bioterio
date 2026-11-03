using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetRotinaAnimalDetail
{
    public class GetRotinaAnimalDetailHandler(
        IMapper mapper,
        IRotinaAnimalRepository rotinaAnimalRepository)
        : IRequestHandler<GetRotinaAnimalDetailQuery, GetRotinaAnimalDetailVm>
    {
        public async Task<GetRotinaAnimalDetailVm> Handle(
            GetRotinaAnimalDetailQuery request,
            CancellationToken cancellationToken)
        {
            var rotina = await rotinaAnimalRepository.GetRotinaWithDetailsAsync(request.Id);

            if (rotina == null)
                throw new NotFoundException(nameof(RotinaAnimal), request.Id);

            return mapper.Map<GetRotinaAnimalDetailVm>(rotina);
        }
    }
}