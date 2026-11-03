using MediatR;
using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.LocaisOrigem.Command.CreateLocalOrigem
{
    public class CreateLocalOrigemCommand : IRequest<CreateLocalOrigemResponse>
    {
        public string Nome { get; set; } = string.Empty;
    }
}
