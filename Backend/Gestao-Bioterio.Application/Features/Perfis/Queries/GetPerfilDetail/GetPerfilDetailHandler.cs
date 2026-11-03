using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Perfis.Queries.GetPerfilDetail
{
    public class GetPerfilDetailHandler(IMapper mapper, IPerfilRepository perfilRepository, IPerfilPermissaoRepository perfilPermissaoRepository) 
        : IRequestHandler<GetPerfilDetailQuery, PerfilDetailVm>
    {
        public async Task<PerfilDetailVm> Handle(GetPerfilDetailQuery request, CancellationToken cancellationToken)
        {
            var perfil = await perfilRepository.GetByIdAsync(request.Id);
            if (perfil == null)
            {
                throw new NotFoundException(nameof(Perfil), request.Id);
            }

            var vm = mapper.Map<PerfilDetailVm>(perfil);
            
            var permissoes = await perfilPermissaoRepository.GetPermissoesEntitiesByPerfilIdAsync(perfil.Id);
            vm.Permissoes = permissoes.Select(p => new PermissaoVm 
            { 
                FuncionalidadeId = p.FuncionalidadeId, 
                NivelAcesso = (int)p.NivelAcesso 
            }).ToList();

            return vm;
        }
    }
}
