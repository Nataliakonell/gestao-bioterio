using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Queries.GetAllPrescricoesMedicacao
{
    public class GetAllPrescricoesMedicacaoQueryHandler(IMapper mapper, IPrescricaoMedicacaoRepository prescricaoMedicacaoRepository)
        : IRequestHandler<GetAllPrescricoesMedicacaoQuery, List<PrescricaoMedicacaoListVm>>
    {
        public async Task<List<PrescricaoMedicacaoListVm>> Handle(GetAllPrescricoesMedicacaoQuery request, CancellationToken cancellationToken)
        {
            List<PrescricaoMedicacao> prescricoes;

            if (request.AnimalId.HasValue)
                prescricoes = await prescricaoMedicacaoRepository.GetPrescricoesByAnimalAsync(request.AnimalId.Value);
            else
                prescricoes = await prescricaoMedicacaoRepository.GetAllPrescricoesWithDetailsAsync();

            return mapper.Map<List<PrescricaoMedicacaoListVm>>(prescricoes);
        }
    }
}