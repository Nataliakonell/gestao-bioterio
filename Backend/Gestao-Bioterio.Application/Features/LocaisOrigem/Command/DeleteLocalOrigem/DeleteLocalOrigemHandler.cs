using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Responses;
using MediatR;

namespace Gestao_Bioterio.Application.Features.LocaisOrigem.Command.DeleteLocalOrigem
{
    public class DeleteLocalOrigemHandler(ILocalOrigemRepository localOrigemRepository) : IRequestHandler<DeleteLocalOrigemCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(DeleteLocalOrigemCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var localOrigemToDelete = await localOrigemRepository.GetByIdAsync(request.Id);

            if (localOrigemToDelete == null)
            {
                response.Success = false;
                response.Message = "Local de origem não encontrado.";
                return response;
            }

            var hasAnimals = await localOrigemRepository.HasAnimalsLinkedAsync(request.Id);
            if (hasAnimals)
            {
                response.Success = false;
                response.Message = "Este local possui animais vinculados e não pode ser excluído.";
                return response;
            }

            await localOrigemRepository.DeleteAsync(localOrigemToDelete);

            response.Success = true;
            response.Message = "Local de origem excluído com sucesso.";

            return response;
        }
    }
}
