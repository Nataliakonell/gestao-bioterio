using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Procedimentos.Queries.GetProcedimentoDetail
{
    public class GetProcedimentoDetailHandler(
        IMapper mapper,
        IProcedimentoRepository procedimentoRepository
    ) : IRequestHandler<GetProcedimentoDetailQuery, ProcedimentoDetailVm>
    {
        public async Task<ProcedimentoDetailVm> Handle(
            GetProcedimentoDetailQuery request,
            CancellationToken cancellationToken)
        {
            var procedimento = await procedimentoRepository.GetByIdWithTipoAsync(request.Id);

            if (procedimento == null)
                throw new NotFoundException(nameof(Procedimento), request.Id);

            return mapper.Map<ProcedimentoDetailVm>(procedimento);
        }
    }
}