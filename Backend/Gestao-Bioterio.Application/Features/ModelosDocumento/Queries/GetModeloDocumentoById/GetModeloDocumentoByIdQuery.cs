using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.ModelosDocumento.Queries.GetModeloDocumentoByType;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ModelosDocumento.Queries.GetModeloDocumentoById
{
    public class GetModeloDocumentoByIdQuery : IRequest<ModeloDocumentoVm?>
    {
        public int Id { get; set; }
    }

    public class GetModeloDocumentoByIdHandler(
        IMapper mapper,
        IModeloDocumentoRepository repository)
        : IRequestHandler<GetModeloDocumentoByIdQuery, ModeloDocumentoVm?>
    {
        public async Task<ModeloDocumentoVm?> Handle(GetModeloDocumentoByIdQuery request, CancellationToken cancellationToken)
        {
            var modelo = await repository.GetByIdWithIncludesAsync(request.Id);
            if (modelo == null) return null;
            return mapper.Map<ModeloDocumentoVm>(modelo);
        }
    }
}
