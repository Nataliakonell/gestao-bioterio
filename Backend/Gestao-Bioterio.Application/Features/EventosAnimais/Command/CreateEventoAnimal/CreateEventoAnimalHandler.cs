using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.EventosAnimais.Command.CreateEventoAnimal
{
    public class CreateEventoAnimalHandler(
        IMapper mapper,
        IEventoAnimalRepository eventoAnimalRepository,
        IValidator<CreateEventoAnimalCommand> validator
    ) : IRequestHandler<CreateEventoAnimalCommand, CreateEventoAnimalResponse>
    {
        public async Task<CreateEventoAnimalResponse> Handle(CreateEventoAnimalCommand command, CancellationToken cancellationToken)
        {
            var response = new CreateEventoAnimalResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (!validationResult.IsValid)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro na validação da inclusão do animal no evento.";
                return response;
            }

            var entity = mapper.Map<EventoAnimal>(command);
            entity = await eventoAnimalRepository.AddAsync(entity);

            response.Success = true;
            response.Id = entity.Id;
            response.EventoAnimal = mapper.Map<CreateEventoAnimalDto>(entity);
            response.Message = "Animal incluído no evento com sucesso!";

            return response;
        }
    }
}
