using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.Alimentacoes.Command.CreateAlimentacao
{
    public class CreateAlimentacaoDto
    {
        public int AnimalId { get; set; }
        public Animal Animal { get; set; } = null!;
        public DateTime DataAlimentacao { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
