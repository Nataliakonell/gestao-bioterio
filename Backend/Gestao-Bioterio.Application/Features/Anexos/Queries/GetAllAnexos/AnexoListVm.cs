namespace Gestao_Bioterio.Application.Features.Anexos.Queries.GetAllAnexos
{
    public class AnexoListVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string? NomeArquivoAnexo { get; set; }
        public string? Descricao { get; set; }
        public DateTime DataCriacao { get; set; }
        public string RF { get; set; } = string.Empty;
        public string NomeProfissional { get; set; } = string.Empty;
        public string? Responsavel { get; set; }
    }
}