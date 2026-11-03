using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Command.UpdateProtocoloDesverminacao
{
    public class UpdateProtocoloDesverminacaoCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public DateTime DataEntrada { get; set; }
        public StatusProtocolo StatusProtocolo { get; set; }
        public bool CicloInicialConcluido { get; set; }
        public DateTime? DataConclusaoCicloInicial { get; set; }
        public DateTime? DataProximaDose { get; set; }
    }
}