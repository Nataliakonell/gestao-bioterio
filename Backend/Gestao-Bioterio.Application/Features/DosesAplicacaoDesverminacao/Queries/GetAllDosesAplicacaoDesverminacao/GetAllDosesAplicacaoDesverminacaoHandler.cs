using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Queries.GetAllDosesAplicacaoDesverminacao
{
    public class GetAllDosesAplicacaoDesverminacaoHandler(
        IMapper mapper,
        IDoseAplicacaoDesverminacaoRepository doseRepository)
        : IRequestHandler<GetAllDosesAplicacaoDesverminacaoQuery, List<DoseAplicacaoDesverminacaoListVm>>
    {
        public async Task<List<DoseAplicacaoDesverminacaoListVm>> Handle(GetAllDosesAplicacaoDesverminacaoQuery request, CancellationToken cancellationToken)
        {
            if (request.ProtocoloDesverminacaoId.HasValue)
            {
                var porProtocolo = await doseRepository.GetDosesByProtocoloAsync(request.ProtocoloDesverminacaoId.Value);
                return mapper.Map<List<DoseAplicacaoDesverminacaoListVm>>(porProtocolo);
            }

            if (request.AnimalId.HasValue)
            {
                var porAnimal = await doseRepository.GetDosesByAnimalAsync(request.AnimalId.Value);
                return mapper.Map<List<DoseAplicacaoDesverminacaoListVm>>(porAnimal);
            }

            var todas = await doseRepository.ListAllAsync();
            return mapper.Map<List<DoseAplicacaoDesverminacaoListVm>>(todas);
        }
    }
}