using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Queries.GetAllAnimalLocalizacao
{
    public class AnimalLocalizacaoListVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string? AnimalNomePopular { get; set; }
        public string? AnimalNumeroRegistro { get; set; }
        public string? AnimalEspecieNome { get; set; }
        public int? AnimalEspecieId { get; set; }
        public Genero? AnimalGenero { get; set; }
        public FaseDeVida? AnimalFaseDeVida { get; set; }
        public int LocalizacaoId { get; set; }
        public string? LocalizacaoNome { get; set; }
        public string? LocalizacaoCaminhoHierarquia { get; set; }
    }
}
