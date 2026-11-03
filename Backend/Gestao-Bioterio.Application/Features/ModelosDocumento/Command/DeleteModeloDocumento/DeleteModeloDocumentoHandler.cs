using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ModelosDocumento.Command.DeleteModeloDocumento
{
    public class DeleteModeloDocumentoHandler(IModeloDocumentoRepository repository)
        : IRequestHandler<DeleteModeloDocumentoCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(DeleteModeloDocumentoCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();
            var modelo = await repository.GetByIdAsync(request.Id);

            if (modelo == null)
            {
                response.Success = false;
                response.Message = "Modelo de documento não encontrado.";
                return response;
            }

            await repository.DeleteAsync(modelo);
            response.Message = "Modelo de documento excluído com sucesso!";
            return response;
        }
    }

}
