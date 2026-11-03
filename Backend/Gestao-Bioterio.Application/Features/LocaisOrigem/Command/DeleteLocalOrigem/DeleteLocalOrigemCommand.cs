using MediatR;
using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.LocaisOrigem.Command.DeleteLocalOrigem
{
    public class DeleteLocalOrigemCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
    }
}
