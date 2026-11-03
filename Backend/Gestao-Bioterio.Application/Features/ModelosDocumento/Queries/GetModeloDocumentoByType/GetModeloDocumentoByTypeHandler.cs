using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ModelosDocumento.Queries.GetModeloDocumentoByType
{
    public class GetModeloDocumentoByTypeHandler(
        IMapper mapper,
        IModeloDocumentoRepository repository)
        : IRequestHandler<GetModeloDocumentoByTypeQuery, ModeloDocumentoVm>
    {
        public async Task<ModeloDocumentoVm> Handle(GetModeloDocumentoByTypeQuery request, CancellationToken cancellationToken)
        {
            var modelo = await repository.GetByTipoDocumentoAsync(request.TipoDocumento);

            if (modelo == null)
            {
                return new ModeloDocumentoVm();
            }

            return mapper.Map<ModeloDocumentoVm>(modelo);
        }
    }
}
