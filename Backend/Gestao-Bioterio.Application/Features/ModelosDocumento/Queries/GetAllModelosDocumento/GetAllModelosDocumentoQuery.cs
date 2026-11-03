using Gestao_Bioterio.Application.Features.ModelosDocumento.Queries.GetModeloDocumentoByType;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ModelosDocumento.Queries.GetAllModelosDocumento
{
    public class GetAllModelosDocumentoQuery : IRequest<List<ModeloDocumentoVm>>
    {
        public TipoSecaoTemplate? TipoSecao { get; set; }
    }
}
