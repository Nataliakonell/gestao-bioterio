using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Alimentacoes.Command.CreateAlimentacao
{
    public class CreateAlimentacaoCommand  : IRequest<CreateAlimentacaoResponse>
    {
        public int AnimalId { get; set; }
        public DateTime? DataAlimentacao { get; set; }
        public decimal? Peso { get; set; }
        public decimal? Comprimento { get; set; }
        public List<CreateRefeicaoCommandDto>? Refeicoes { get; set; }
        public decimal? PorcentagemPesoRecomendado { get; set; }
        public decimal PesoRecomendado { get; set; }
        public string? Observacoes { get; set; }
    }

    public class CreateRefeicaoCommandDto
    {
        public TipoRefeicao TipoRefeicao { get; set; }
        public decimal PesoRefeicao { get; set; }
        public SituacaoRefeicao SituacaoRefeicao { get; set; }
    }
}
