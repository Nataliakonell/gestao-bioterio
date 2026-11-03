using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.UpdateLiberacaoQuarentena
{
    public class UpdateLiberacaoQuarentenaHandler(
        IMapper mapper,
        ILiberacaoQuarentenaRepository repository,
        IAnimalRepository animalRepository,
        IValidator<UpdateLiberacaoQuarentenaCommand> validator) : IRequestHandler<UpdateLiberacaoQuarentenaCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateLiberacaoQuarentenaCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();
            var validationResult = await validator.ValidateAsync(request, cancellationToken);

            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var entityToUpdate = await repository.GetByIdAsync(request.Id);
            if (entityToUpdate == null)
            {
                response.Success = false;
                response.Message = "Registro de liberação de quarentena não encontrado.";
                return response;
            }

            mapper.Map(request, entityToUpdate, typeof(UpdateLiberacaoQuarentenaCommand), typeof(LiberacaoQuarentena));
            await repository.UpdateAsync(entityToUpdate);

            // Atualiza a instalação do animal se informada
            if (request.InstalacaoBioterioId.HasValue && request.InstalacaoBioterioId.Value > 0)
            {
                var animal = await animalRepository.GetByIdAsync(request.AnimalId);
                if (animal != null && animal.InstalacaoBioterioId != request.InstalacaoBioterioId.Value)
                {
                    animal.InstalacaoBioterioId = request.InstalacaoBioterioId.Value;
                    await animalRepository.UpdateAsync(animal);
                }
            }

            response.Success = true;
            response.Message = "Liberação da quarentena atualizada com sucesso!";
            return response;
        }
    }
}
