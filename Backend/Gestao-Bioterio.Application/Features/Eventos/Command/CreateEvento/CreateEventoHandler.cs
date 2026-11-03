using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Eventos.Command.CreateEvento
{
    public class CreateEventoHandler(
        IMapper mapper,
        IEventoRepository eventoRepository,
        IEventoAnimalRepository eventoAnimalRepository,
        IValidator<CreateEventoCommand> validator
    ) : IRequestHandler<CreateEventoCommand, CreateEventoResponse>
    {
        public async Task<CreateEventoResponse> Handle(CreateEventoCommand command, CancellationToken cancellationToken)
        {
            var response = new CreateEventoResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (!validationResult.IsValid)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro na validação do agendamento do evento.";
                return response;
            }

            var entity = mapper.Map<Evento>(command);
            entity.Status = Status.Agendado;
            entity = await eventoRepository.AddAsync(entity);

            if (command.AnimalIds != null && command.AnimalIds.Any())
            {
                foreach (var animalId in command.AnimalIds.Distinct())
                {
                    await eventoAnimalRepository.AddAsync(new EventoAnimal
                    {
                        EventoId = entity.Id,
                        AnimalId = animalId
                    });
                }
            }

            response.Success = true;
            response.Id = entity.Id;
            response.Evento = mapper.Map<CreateEventoDto>(entity);
            response.Message = "Evento cadastrado com sucesso!";

            return response;
        }
    }
}
