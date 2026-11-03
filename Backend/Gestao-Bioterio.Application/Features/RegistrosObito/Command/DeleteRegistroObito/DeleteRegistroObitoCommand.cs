using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.RegistrosObito.Command.DeleteRegistroObito
{
    public class DeleteRegistroObitoCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
    }
}
