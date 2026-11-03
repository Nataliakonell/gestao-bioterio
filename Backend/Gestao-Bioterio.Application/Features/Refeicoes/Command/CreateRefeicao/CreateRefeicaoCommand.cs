using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Refeicoes.Command.CreateRefeicao
{
    public class CreateRefeicaoCommand : IRequest<CreateRefeicaoResponse>
    {
        public int AlimentacaoId { get; set; }
        public TipoRefeicao TipoRefeicao { get; set; }
        public decimal PesoRefeicao { get; set; }
        public SituacaoRefeicao SituacaoRefeicao { get; set; }
    }
}
