using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.Localizacoes.Command.CreateLocalizacao
{
    public class CreateLocalizacaoDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public Ambiente Ambiente { get; set; }
        public int? LocalizacaoPaiId { get; set; }
        public string? CaminhoHierarquia { get; set; }
    }
}
