using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.InstalacoesBioterio.Queries.GetInstalacaoBioterioDetail;
using Gestao_Bioterio.Application.Features.InstalacoesBioterio.Queries;
using MediatR;

namespace Gestao_Bioterio.Application.Features.InstalacoesBioterio.Queries
{
    public class GetInstalacaoBioterioDetailQueryHandler(IMapper mapper, IInstalacaoBioterioRepository instalacaoBioterioRepository) : IRequestHandler<GetInstalacaoBioterioDetailQuery, GetInstalacaoBioterioDetailVm>
    {
        public async Task<GetInstalacaoBioterioDetailVm> Handle(GetInstalacaoBioterioDetailQuery request, CancellationToken cancellationToken)
        {
            var instalacaoBioterio = await instalacaoBioterioRepository.GetByIdAsync(request.Id);
            return mapper.Map<GetInstalacaoBioterioDetailVm>(instalacaoBioterio);
        }
    }
}

