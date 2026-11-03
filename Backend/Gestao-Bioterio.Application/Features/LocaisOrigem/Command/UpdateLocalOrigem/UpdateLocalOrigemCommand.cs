using MediatR;
using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.LocaisOrigem.Command.UpdateLocalOrigem
{
    public class UpdateLocalOrigemCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }
}
