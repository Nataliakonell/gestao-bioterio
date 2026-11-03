using Gestao_Bioterio.Domain.Common;

namespace Gestao_Bioterio.Domain.Entities
{
    public class Alimentacao : AuditableEntity
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public DateTime DataAlimentacao { get; set; }
        public int? BiometriaAnimalId { get; set; }
        public decimal PesoRecomendado { get; set; }
        public decimal TotalOfertado { get; set; }
        public decimal TotalConsumido { get; set; }
        public decimal Saldo { get; set; }
        public decimal? PorcentagemPesoRecomendado { get; set; }
        public StatusAlimentacao Status { get; set; } = StatusAlimentacao.Pendente;
        public string? Observacoes { get; set; }
        public ICollection<Refeicao> Refeicoes { get; set; } = new List<Refeicao>();
        public BiometriaAnimal? BiometriaAnimal { get; set; }
        public Gestao_Bioterio.Domain.Entities.Animal Animal { get; set; } = null!;
        
        public void RecalcularTotais()
        {
            if (Refeicoes != null && Refeicoes.Any())
            {
                TotalOfertado = Refeicoes.Sum(r => r.PesoRefeicao);
                TotalConsumido = Refeicoes
                    .Where(r => r.SituacaoRefeicao == SituacaoRefeicao.Aceitou)
                    .Sum(r => r.PesoRefeicao);
                Saldo = TotalConsumido - PesoRecomendado;
            }
            else
            {
                TotalOfertado = 0;
                TotalConsumido = 0;
                Saldo = -PesoRecomendado;
            }
        }

        public void RecalcularStatus()
        {
            Status = Refeicoes != null && Refeicoes.Any() && Refeicoes.All(r => r.SituacaoRefeicao != SituacaoRefeicao.Pendente)
                ? StatusAlimentacao.Alimentada
                : StatusAlimentacao.Pendente;
        }

        public enum StatusAlimentacao
        {
            Pendente = 0,
            Alimentada = 1
        }
    }
}