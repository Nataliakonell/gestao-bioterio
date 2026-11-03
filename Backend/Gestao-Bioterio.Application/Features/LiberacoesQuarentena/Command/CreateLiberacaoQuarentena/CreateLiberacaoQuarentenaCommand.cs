using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.CreateLiberacaoQuarentena
{
    public class CreateLiberacaoQuarentenaCommand : IRequest<CreateLiberacaoQuarentenaResponse>
    {
        public int AnimalId { get; set; }
        public DateTime DataEntradaQuarentena { get; set; }
        public DateTime DataSaidaQuarentena { get; set; }
        public int? InstalacaoBioterioId { get; set; }
        public int? LocalizacaoDestinoId { get; set; }
        public string? Responsavel { get; set; }
    }
}
