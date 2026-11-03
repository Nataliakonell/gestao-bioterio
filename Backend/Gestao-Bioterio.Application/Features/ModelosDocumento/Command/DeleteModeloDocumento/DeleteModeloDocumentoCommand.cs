using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ModelosDocumento.Command.DeleteModeloDocumento
{
    public class DeleteModeloDocumentoCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
    }
}
