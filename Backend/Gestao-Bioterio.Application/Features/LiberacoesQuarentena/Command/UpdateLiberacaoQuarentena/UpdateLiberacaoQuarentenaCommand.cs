using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.UpdateLiberacaoQuarentena
{
    public class UpdateLiberacaoQuarentenaCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public DateTime DataEntradaQuarentena { get; set; }
        public DateTime DataSaidaQuarentena { get; set; }
        public int? InstalacaoBioterioId { get; set; }
        public string? Responsavel { get; set; }
    }
}
