using MediatR;

namespace Gestao_Bioterio.Application.Features.Localizacoes.Command.DeleteLocalizacao
{
    public class DeleteLocalizacaoCommand : IRequest
    {
        public int Id { get; set; }
    }
}
