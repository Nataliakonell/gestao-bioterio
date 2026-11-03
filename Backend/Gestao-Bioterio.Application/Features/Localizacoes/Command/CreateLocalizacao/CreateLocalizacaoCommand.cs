using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Localizacoes.Command.CreateLocalizacao
{
    public class CreateLocalizacaoCommand : IRequest<CreateLocalizacaoResponse>
    {
        public string Nome { get; set; } = string.Empty;
        public int? LocalizacaoPaiId { get; set; }
        public Ambiente Ambiente { get; set; }
    }
}
