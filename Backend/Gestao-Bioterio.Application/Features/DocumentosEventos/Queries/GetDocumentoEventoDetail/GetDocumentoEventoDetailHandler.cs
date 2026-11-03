using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.DocumentosEventos.Queries.GetDocumentoEventoDetail
{
    public class GetDocumentoEventoDetailHandler(
        IMapper mapper,
        IDocumentoEventoRepository documentoEventoRepository,
        IModeloDocumentoRepository modeloDocumentoRepository
    ) : IRequestHandler<GetDocumentoEventoDetailQuery, DocumentoEventoDetailVm?>
    {
        public async Task<DocumentoEventoDetailVm?> Handle(GetDocumentoEventoDetailQuery request, CancellationToken cancellationToken)
        {
            var entity = await documentoEventoRepository.GetByIdAsync(request.Id);
            if (entity == null)
                return null;

            var modelo = await modeloDocumentoRepository.GetByIdAsync(entity.ModeloDocumentoId);

            var vm = mapper.Map<DocumentoEventoDetailVm>(entity);
            if (modelo != null)
            {
                vm.ModeloDocumentoTitulo = modelo.Nome;
            }

            return vm;
        }
    }
}
