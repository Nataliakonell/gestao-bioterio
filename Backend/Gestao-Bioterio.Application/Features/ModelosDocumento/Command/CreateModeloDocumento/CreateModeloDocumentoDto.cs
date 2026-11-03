using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.ModelosDocumento.Command.CreateModeloDocumento
{
    public class CreateModeloDocumentoDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public TipoSecaoTemplate TipoSecao { get; set; }
        public TipoDocumento TipoDocumento { get; set; }
        public string? Conteudo { get; set; }
        public int? HeaderTemplateId { get; set; }
        public int? FooterTemplateId { get; set; }
        public string? ConfiguracaoLayoutJson { get; set; }
        public bool Ativo { get; set; }
    }

}
