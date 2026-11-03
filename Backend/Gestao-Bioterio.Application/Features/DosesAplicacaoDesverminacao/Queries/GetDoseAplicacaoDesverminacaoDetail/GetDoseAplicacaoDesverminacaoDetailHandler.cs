using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Queries.GetDoseAplicacaoDesverminacaoDetail
{
    public class GetDoseAplicacaoDesverminacaoDetailHandler(
        IMapper mapper,
        IDoseAplicacaoDesverminacaoRepository doseRepository)
        : IRequestHandler<GetDoseAplicacaoDesverminacaoDetailQuery, DoseAplicacaoDesverminacaoDetailVm>
    {
        public async Task<DoseAplicacaoDesverminacaoDetailVm> Handle(GetDoseAplicacaoDesverminacaoDetailQuery request, CancellationToken cancellationToken)
        {
            var dose = await doseRepository.GetByIdAsync(request.Id);

            if (dose == null)
                throw new NotFoundException(nameof(DoseAplicacaoDesverminacao), request.Id);

            return mapper.Map<DoseAplicacaoDesverminacaoDetailVm>(dose);
        }
    }
}