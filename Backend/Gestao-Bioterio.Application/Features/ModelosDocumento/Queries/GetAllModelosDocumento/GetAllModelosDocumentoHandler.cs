using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.ModelosDocumento.Queries.GetModeloDocumentoByType;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ModelosDocumento.Queries.GetAllModelosDocumento
{
    public class GetAllModelosDocumentoHandler(
        IMapper mapper,
        IModeloDocumentoRepository repository)
        : IRequestHandler<GetAllModelosDocumentoQuery, List<ModeloDocumentoVm>>
    {
        public async Task<List<ModeloDocumentoVm>> Handle(GetAllModelosDocumentoQuery request, CancellationToken cancellationToken)
        {
            var modelos = await repository.GetAllWithIncludesAsync(request.TipoSecao);
            return mapper.Map<List<ModeloDocumentoVm>>(modelos);
        }
    }
}
