namespace Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.CreateAnimalLocalizacao
{
    public class CreateAnimalLocalizacaoDto
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public int LocalizacaoId { get; set; }
        public string? AnimalNomePopular { get; set; }
        public string? AnimalNumeroRegistro { get; set; }
        public string? LocalizacaoNome { get; set; }
        public string? LocalizacaoCaminhoHierarquia { get; set; }
    }
}
