using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Anexos.Queries.GetAnexoDetail
{
    public class GetAnexoDetailHandler(
        IMapper mapper,
        IAnexoRepository anexoRepository
    ) : IRequestHandler<GetAnexoDetailQuery, AnexoDetailVm>
    {
        public async Task<AnexoDetailVm> Handle(
            GetAnexoDetailQuery request,
            CancellationToken cancellationToken)
        {
            var anexo = await anexoRepository.GetByIdAsync(request.Id);

            if (anexo == null)
                throw new NotFoundException(nameof(Anexo), request.Id);

            return mapper.Map<AnexoDetailVm>(anexo);
        }
    }
}