namespace Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Queries.GetAnimalLocalizacaoDetail
{
    public class AnimalLocalizacaoDetailVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string? AnimalNomePopular { get; set; }
        public string? AnimalNumeroRegistro { get; set; }
        public int LocalizacaoId { get; set; }
        public string? LocalizacaoNome { get; set; }
        public string? LocalizacaoCaminhoHierarquia { get; set; }
    }
}
