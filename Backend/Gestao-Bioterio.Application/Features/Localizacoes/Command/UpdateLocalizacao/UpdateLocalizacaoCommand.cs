using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Localizacoes.Command.UpdateLocalizacao
{
    public class UpdateLocalizacaoCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int? LocalizacaoPaiId { get; set; }
        public Ambiente Ambiente { get; set; }
    }
}
