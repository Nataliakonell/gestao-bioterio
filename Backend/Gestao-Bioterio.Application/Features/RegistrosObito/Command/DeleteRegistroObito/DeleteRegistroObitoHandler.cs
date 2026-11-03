using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.RegistrosObito.Command.DeleteRegistroObito
{
    public class DeleteRegistroObitoHandler(
        IRegistroObitoRepository repository,
        IAnimalRepository animalRepository)
        : IRequestHandler<DeleteRegistroObitoCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(DeleteRegistroObitoCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();
            var entity = await repository.GetByIdAsync(request.Id);
            if (entity == null)
            {
                response.Success = false;
                response.Message = "Registro de óbito não encontrado.";
                return response;
            }

            var animal = await animalRepository.GetByIdAsync(entity.AnimalId);
            if (animal != null && animal.SituacaoAnimal == Situacao.Obito)
            {
                animal.SituacaoAnimal = Situacao.Vivo;
                await animalRepository.UpdateAsync(animal);
            }

            await repository.DeleteAsync(entity);
            response.Message = "Registro de óbito excluído com sucesso e situação do animal revertida para Vivo.";
            return response;
        }
    }
}
