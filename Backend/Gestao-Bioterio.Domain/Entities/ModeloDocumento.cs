using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class ModeloDocumento : AuditableEntity
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public TipoSecaoTemplate TipoSecao { get; set; } = TipoSecaoTemplate.Body;
        public TipoDocumento TipoDocumento { get; set; } = TipoDocumento.AltaAmbulatorial;
        public string Conteudo { get; set; } = string.Empty;
        public int? HeaderTemplateId { get; set; }
        public ModeloDocumento? HeaderTemplate { get; set; }
        public int? FooterTemplateId { get; set; }
        public ModeloDocumento? FooterTemplate { get; set; }
        public string? ConfiguracaoLayoutJson { get; set; }
        public bool Ativo { get; set; } = true;
    }
    public enum TipoSecaoTemplate
    {
        Body = 1,
        Header = 2,
        Footer = 3
    }

    public enum TipoDocumento
    {
        Geral = 0,
        AltaAmbulatorial = 1,
        LiberacaoQuarentena = 2,
        SolicitacaoExame = 3,
        Consulta = 4,
        DocumentoDeEventoExterno  =  5
    }
}
