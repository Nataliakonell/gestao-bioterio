using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Queries.GetAllMedicacoesAdministradas
{
    public class GetAllMedicacoesAdministradasQueryHandler(IMapper mapper, IMedicacaoAdministradaRepository medicacaoAdministradaRepository)
        : IRequestHandler<GetAllMedicacoesAdministradasQuery, List<MedicacaoAdministradaListVm>>
    {
        public async Task<List<MedicacaoAdministradaListVm>> Handle(GetAllMedicacoesAdministradasQuery request, CancellationToken cancellationToken)
        {
            List<MedicacaoAdministrada> administracoes;

            if (request.AnimalId.HasValue)
                administracoes = await medicacaoAdministradaRepository.GetAdministracoesByAnimalAsync(request.AnimalId.Value);
            else if (request.PrescricaoMedicacaoId.HasValue)
                administracoes = await medicacaoAdministradaRepository.GetAdministracoesByPrescricaoAsync(request.PrescricaoMedicacaoId.Value);
            else if (request.Data.HasValue)
                administracoes = await medicacaoAdministradaRepository.GetAdministracoesPendentesAsync(request.Data.Value);
            else
                administracoes = await medicacaoAdministradaRepository.GetAllWithIncludesAsync();

            return mapper.Map<List<MedicacaoAdministradaListVm>>(administracoes);
        }
    }
}