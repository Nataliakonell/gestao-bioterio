using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Alimentacoes.Command.UpdateAlimentacao
{
    public class UpdateAlimentacaoCommand : IRequest<UpdateAlimentacaoResponse>
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public DateTime? DataAlimentacao { get; set; }
        public decimal? Peso { get; set; }
        public decimal? Comprimento { get; set; }
        public decimal? PorcentagemPesoRecomendado { get; set; }
        public decimal PesoRecomendado { get; set; }
        public string? Observacoes { get; set; }

        public List<UpdateRefeicaoCommandDto>? Refeicoes { get; set; }
    }

    public class UpdateRefeicaoCommandDto
    {
        public int? Id { get; set; }
        public TipoRefeicao TipoRefeicao { get; set; }
        public decimal PesoRefeicao { get; set; }
        public SituacaoRefeicao SituacaoRefeicao { get; set; }
    }
}
