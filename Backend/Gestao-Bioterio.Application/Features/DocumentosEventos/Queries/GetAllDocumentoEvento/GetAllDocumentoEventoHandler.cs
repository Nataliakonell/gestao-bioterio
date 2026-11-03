using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.DocumentosEventos.Queries.GetAllDocumentoEvento
{
    public class GetAllDocumentoEventoHandler(
        IMapper mapper,
        IDocumentoEventoRepository documentoEventoRepository,
        IModeloDocumentoRepository modeloDocumentoRepository
    ) : IRequestHandler<GetAllDocumentoEventoQuery, List<DocumentoEventoListVm>>
    {
        public async Task<List<DocumentoEventoListVm>> Handle(GetAllDocumentoEventoQuery request, CancellationToken cancellationToken)
        {
            List<DocumentoEvento> list;
            if (request.EventoId.HasValue && request.EventoId.Value > 0)
            {
                var doc = await documentoEventoRepository.ObterPorEventoIdAsync(request.EventoId.Value);
                list = doc != null ? new List<DocumentoEvento> { doc } : new List<DocumentoEvento>();
            }
            else
            {
                var all = await documentoEventoRepository.ListAllAsync();
                list = all.ToList();
            }

            var modelos = await modeloDocumentoRepository.ListAllAsync();
            var modeloDict = modelos.ToDictionary(m => m.Id);

            var vms = new List<DocumentoEventoListVm>();
            foreach (var item in list)
            {
                var vm = mapper.Map<DocumentoEventoListVm>(item);
                if (modeloDict.TryGetValue(item.ModeloDocumentoId, out var m))
                {
                    vm.ModeloDocumentoTitulo = m.Nome;
                }
                vms.Add(vm);
            }

            return vms;
        }
    }
}
