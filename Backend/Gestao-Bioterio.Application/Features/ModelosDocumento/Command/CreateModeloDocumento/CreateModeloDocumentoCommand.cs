using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ModelosDocumento.Command.CreateModeloDocumento
{
    public class CreateModeloDocumentoCommand : IRequest<CreateModeloDocumentoResponse>
    {
        public string Nome { get; set; } = string.Empty;
        public TipoSecaoTemplate TipoSecao { get; set; } = TipoSecaoTemplate.Body;
        public TipoDocumento TipoDocumento { get; set; } = TipoDocumento.AltaAmbulatorial;
        public string? Conteudo { get; set; }
        public int? HeaderTemplateId { get; set; }
        public int? FooterTemplateId { get; set; }
        public string? ConfiguracaoLayoutJson { get; set; }
        public bool Ativo { get; set; } = true;
    }
}
