using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.TiposProcedimento.Queries.GetTipoProcedimentoDetail
{
    public class GetTipoProcedimentoDetailHandler(ITipoProcedimentoRepository repository, IMapper mapper) 
        : IRequestHandler<GetTipoProcedimentoDetailQuery, TipoProcedimentoDetailVm>
    {
        public async Task<TipoProcedimentoDetailVm> Handle(GetTipoProcedimentoDetailQuery request, CancellationToken cancellationToken)
        {
            var entity = await repository.GetByIdAsync(request.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(TipoProcedimento), request.Id);
            }

            return mapper.Map<TipoProcedimentoDetailVm>(entity);
        }
    }
}
