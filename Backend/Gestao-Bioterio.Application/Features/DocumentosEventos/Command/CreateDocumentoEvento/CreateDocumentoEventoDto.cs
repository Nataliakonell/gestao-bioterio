namespace Gestao_Bioterio.Application.Features.DocumentosEventos.Command.CreateDocumentoEvento
{
    public class CreateDocumentoEventoDto
    {
        public int Id { get; set; }
        public int EventoId { get; set; }
        public int ModeloDocumentoId { get; set; }
        public string ConteudoDadosJson { get; set; } = string.Empty;
    }
}
