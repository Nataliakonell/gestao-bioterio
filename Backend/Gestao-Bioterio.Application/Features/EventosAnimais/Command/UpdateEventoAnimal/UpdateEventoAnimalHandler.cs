using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.EventosAnimais.Command.UpdateEventoAnimal
{
    public class UpdateEventoAnimalHandler(
        IEventoAnimalRepository eventoAnimalRepository,
        IValidator<UpdateEventoAnimalCommand> validator
    ) : IRequestHandler<UpdateEventoAnimalCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateEventoAnimalCommand command, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (!validationResult.IsValid)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro na validação da atualização do vínculo animal-evento.";
                return response;
            }

            var entity = await eventoAnimalRepository.GetByIdAsync(command.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(EventoAnimal), command.Id);
            }

            entity.EventoId = command.EventoId;
            entity.AnimalId = command.AnimalId;

            await eventoAnimalRepository.UpdateAsync(entity);

            response.Success = true;
            response.Message = "Vínculo animal-evento atualizado com sucesso!";
            return response;
        }
    }
}
