namespace Gestao_Bioterio.Application.Features.DocumentosEventos.Queries.GetDocumentoEventoDetail
{
    public class DocumentoEventoDetailVm
    {
        public int Id { get; set; }
        public int EventoId { get; set; }
        public int ModeloDocumentoId { get; set; }
        public string? ModeloDocumentoTitulo { get; set; }
        public string ConteudoDadosJson { get; set; } = string.Empty;
        public DateTime DataCriacao { get; set; }
        public string RF { get; set; } = string.Empty;
    }
}
