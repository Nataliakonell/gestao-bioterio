using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ModelosDocumento.Queries.GetModeloDocumentoByType
{
    public class GetModeloDocumentoByTypeQuery : IRequest<ModeloDocumentoVm>
    {
        public TipoDocumento TipoDocumento { get; set; }
    }

    public class ModeloDocumentoVm
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public TipoSecaoTemplate TipoSecao { get; set; }
        public TipoDocumento TipoDocumento { get; set; }
        public string? Conteudo { get; set; }
        public int? HeaderTemplateId { get; set; }
        public ModeloDocumentoVm? HeaderTemplate { get; set; }
        public int? FooterTemplateId { get; set; }
        public ModeloDocumentoVm? FooterTemplate { get; set; }
        public string? ConfiguracaoLayoutJson { get; set; }
        public bool Ativo { get; set; }
    }
}
