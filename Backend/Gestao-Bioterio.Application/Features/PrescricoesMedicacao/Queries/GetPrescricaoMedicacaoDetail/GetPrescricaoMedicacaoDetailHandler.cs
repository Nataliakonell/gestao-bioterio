using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Queries.GetPrescricaoMedicacaoDetail
{
    public class GetPrescricaoMedicacaoDetailHandler(
        IMapper mapper,
        IPrescricaoMedicacaoRepository prescricaoMedicacaoRepository)
        : IRequestHandler<GetPrescricaoMedicacaoDetailQuery, PrescricaoMedicacaoDetailVm>
    {
        public async Task<PrescricaoMedicacaoDetailVm> Handle(
            GetPrescricaoMedicacaoDetailQuery request,
            CancellationToken cancellationToken)
        {
            var prescricao = await prescricaoMedicacaoRepository.GetPrescricaoWithDetailsAsync(request.Id);

            if (prescricao == null)
                throw new NotFoundException(nameof(PrescricaoMedicacao), request.Id);

            return mapper.Map<PrescricaoMedicacaoDetailVm>(prescricao);
        }
    }
}