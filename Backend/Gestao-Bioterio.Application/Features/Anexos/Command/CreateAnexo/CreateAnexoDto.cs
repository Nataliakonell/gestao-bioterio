namespace Gestao_Bioterio.Application.Features.Anexos.Command.CreateAnexo
{
    public class CreateAnexoDto
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string? NomeArquivoAnexo { get; set; }
        public string? Descricao { get; set; }
        public string? Responsavel { get; set; }
    }
}