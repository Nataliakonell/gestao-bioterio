using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Application.Exceptions;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Gestao_Bioterio.Application.Features.BiometriaAnimais.Queries.GetBiometriaAnimalDetail
{
    public class GetBiometriaAnimalDetailHandler(IMapper mapper, IBiometriaAnimalRepository biometriaAnimalRepository)
        : IRequestHandler<GetBiometriaAnimalDetailQuery, GetBiometriaAnimalDetailVm>
    {
        public async Task<GetBiometriaAnimalDetailVm> Handle(GetBiometriaAnimalDetailQuery request, CancellationToken cancellationToken)
        {
            var biometria = await biometriaAnimalRepository.GetBiometriaWithDetailsAsync(request.Id);

            if (biometria == null)
                throw new NotFoundException(nameof(BiometriaAnimal), request.Id);

            return mapper.Map<GetBiometriaAnimalDetailVm>(biometria);
        }
    }
}
