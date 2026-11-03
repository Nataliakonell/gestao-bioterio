using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Queries.GetAllMovimentacaoAnimal
{
    public class MovimentacaoAnimalListVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string? AnimalNomePopular { get; set; }
        public string? AnimalNumeroRegistro { get; set; }
        public int LocalizacaoId { get; set; }
        public string? LocalizacaoNome { get; set; }
        public string? LocalizacaoCaminhoHierarquia { get; set; }
        public int? EventoId { get; set; }
        public TipoMovimentacao TipoMovimentacao { get; set; }
        public string TipoMovimentacaoDescricao => TipoMovimentacao.ToString();
        public DateTime DataCriacao { get; set; }
        public string RF { get; set; } = string.Empty;
    }
}
