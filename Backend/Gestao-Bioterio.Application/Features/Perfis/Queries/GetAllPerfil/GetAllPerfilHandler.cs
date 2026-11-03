using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Perfis.Queries.GetAllPerfil
{
    public class GetAllPerfilHandler(IMapper mapper, IPerfilRepository perfilRepository) 
        : IRequestHandler<GetAllPerfilQuery, List<PerfilListVm>>
    {
        public async Task<List<PerfilListVm>> Handle(GetAllPerfilQuery request, CancellationToken cancellationToken)
        {
            var perfis = await perfilRepository.ListAllAsync();
            return mapper.Map<List<PerfilListVm>>(perfis);
        }
    }
}
