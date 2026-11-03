using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Command.UpdateDoseAplicacaoDesverminacao
{
    public class UpdateDoseAplicacaoDesverminacaoCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public int ProtocoloDesverminacaoId { get; set; }
        public TipoDose TipoDose { get; set; }
        public DateTime DataPrevista { get; set; }
        public DateTime? DataAplicacao { get; set; }
        public StatusDoseDesverminacao StatusDoseDesverminacao { get; set; }
        public string? Observacao { get; set; }
        public string? Responsavel { get; set; }
    }
}