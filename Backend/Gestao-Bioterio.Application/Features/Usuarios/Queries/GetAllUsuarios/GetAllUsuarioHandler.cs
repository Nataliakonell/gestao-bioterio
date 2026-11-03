using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Usuarios.Queries.GetAllUsuarios
{
    public class GetAllUsuarioHandler(IMapper mapper, IUsuarioRepository usuarioRepository) : IRequestHandler<GetAllUsuarioQuery, PaginatedUsuarioListVm>
    {
        public async Task<PaginatedUsuarioListVm> Handle(GetAllUsuarioQuery request, CancellationToken cancellationToken)
        {
            var page = request.Page > 0 ? request.Page : 1;
            var pageSize = request.PageSize > 0 ? request.PageSize : 10;

            var items = await usuarioRepository.GetUsuarioListAsync(request.SearchTerm, request.Status, page, pageSize);
            var totalCount = await usuarioRepository.GetUsuarioCountAsync(request.SearchTerm, request.Status);

            return new PaginatedUsuarioListVm
            {
                Items = mapper.Map<List<UsuarioListVm>>(items),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}
