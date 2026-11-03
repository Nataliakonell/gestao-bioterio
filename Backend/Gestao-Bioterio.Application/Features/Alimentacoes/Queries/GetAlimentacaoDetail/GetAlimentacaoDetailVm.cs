using Gestao_Bioterio.Domain.Entities;
using static Gestao_Bioterio.Domain.Entities.Alimentacao;

namespace Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAlimentacaoDetail
{
    public class GetAlimentacaoDetailVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public DateTime DataAlimentacao { get; set; }
        public int BiometriaAnimalId { get; set; }
        public decimal PorcentagemPesoRecomendado { get; set; }
        public decimal PesoRecomendado { get; set; }
        public decimal TotalOfertado { get; set; }
        public decimal TotalConsumido { get; set; }
        public decimal Saldo { get; set; }
        public StatusAlimentacao Status { get; set; } = StatusAlimentacao.Pendente;
        public string? Observacoes { get; set; }
        public ICollection<Refeicao> Refeicoes { get; set; } = new List<Refeicao>();
        public BiometriaAnimal BiometriaAnimal { get; set; } = null!;
    }

}
