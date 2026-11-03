using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Application.Contracts.Infrastructure;

namespace Gestao_Bioterio.Application.Features.Animais.Queries.GetAnimalDetail
{
    public class GetAnimalDetailQueryHandler(IMapper mapper, IAnimalRepository animalRepository, IBlobStorageService blobStorageService) : IRequestHandler<GetAnimalDetailQuery, RotinaAnimalDetailVm>
    {    
        public async Task<RotinaAnimalDetailVm> Handle(GetAnimalDetailQuery request, CancellationToken cancellationToken)
        {
            var animal = await animalRepository.GetAnimalWithDetailsAsync(request.Id);
            
            if (animal == null)
                throw new NotFoundException(nameof(Animal), request.Id);

            var animalVm = mapper.Map<RotinaAnimalDetailVm>(animal);

            if (!string.IsNullOrEmpty(animal.NomeArquivoFoto))
            {
                animalVm.FotoAnimal = await blobStorageService.DownloadFileAsync(animal.NomeArquivoFoto);
            }

            return animalVm;
        }
    }
}
