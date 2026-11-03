using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.InstalacoesBioterio.Queries.GetAllInstalacaoBioterio
{
    public class GetAllInstalacaoBioterioQueryHandler(IMapper mapper, IInstalacaoBioterioRepository instalacaoBioterioRepository)
        : IRequestHandler<GetAllInstalacaoBioterioQuery, List<InstalacaoBioterioListVm>>
    {
        public async Task<List<InstalacaoBioterioListVm>> Handle(GetAllInstalacaoBioterioQuery request, CancellationToken cancellationToken)
        {
            var locations = await instalacaoBioterioRepository.ListAllAsync();
            return mapper.Map<List<InstalacaoBioterioListVm>>(locations.ToList());
        }
    }
}

