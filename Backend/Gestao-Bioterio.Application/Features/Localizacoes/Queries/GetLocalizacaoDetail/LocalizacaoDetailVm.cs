using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.Localizacoes.Queries.GetLocalizacaoDetail
{
    public class LocalizacaoDetailVm
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int? LocalizacaoPaiId { get; set; }
        public string? LocalizacaoPaiNome { get; set; }
        public Ambiente Ambiente { get; set; }
        public string? CaminhoIds { get; set; }
        public string? CaminhoHierarquia { get; set; }
        public int QuantidadeAnimais { get; set; }
    }
}
