using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Command.CreateDoseAplicacaoDesverminacao
{
    public class CreateDoseAplicacaoDesverminacaoCommand : IRequest<CreateDoseAplicacaoDesverminacaoResponse>
    {
        public int ProtocoloDesverminacaoId { get; set; }
        public TipoDose TipoDose { get; set; }
        public DateTime DataPrevista { get; set; }
        public DateTime? DataAplicacao { get; set; }
        public StatusDoseDesverminacao StatusDoseDesverminacao { get; set; }
        public string? Observacao { get; set; }
        public string? Responsavel { get; set; }
    }
}