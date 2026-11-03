using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.SolicitacoesExame.Command.CreateSolicitacaoExame
{
    public class CreateSolicitacaoExameCommand : IRequest<CreateSolicitacaoExameResponse>
    {
        public int AnimalId { get; set; }
        public TipoExame TipoExame { get; set; }
        public string? SinaisClinicos { get; set; }
        public string? SuspeitaClinica { get; set; }
        public string RegiaoAnatomica { get; set; } = string.Empty;
        public string? Observacao { get; set; }
        public string? Responsavel { get; set; }
    }
}