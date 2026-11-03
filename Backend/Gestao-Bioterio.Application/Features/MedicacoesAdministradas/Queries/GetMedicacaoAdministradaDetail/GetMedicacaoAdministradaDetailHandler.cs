using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Queries.GetMedicacaoAdministradaDetail
{
    public class GetMedicacaoAdministradaDetailHandler(
        IMapper mapper,
        IMedicacaoAdministradaRepository medicacaoAdministradaRepository)
        : IRequestHandler<GetMedicacaoAdministradaDetailQuery, MedicacaoAdministradaDetailVm>
    {
        public async Task<MedicacaoAdministradaDetailVm> Handle(
            GetMedicacaoAdministradaDetailQuery request,
            CancellationToken cancellationToken)
        {
            var administracao = await medicacaoAdministradaRepository.GetByIdAsync(request.Id);

            if (administracao == null)
                throw new NotFoundException(nameof(MedicacaoAdministrada), request.Id);

            return mapper.Map<MedicacaoAdministradaDetailVm>(administracao);
        }
    }
}