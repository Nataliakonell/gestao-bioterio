using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.RegistrosObito.Command.CreateRegistroObito
{
    public class CreateRegistroObitoHandler(
        IMapper mapper,
        IRegistroObitoRepository registroObitoRepository,
        IAnimalRepository animalRepository,
        IValidator<CreateRegistroObitoCommand> validator)
        : IRequestHandler<CreateRegistroObitoCommand, CreateRegistroObitoResponse>
    {
        public async Task<CreateRegistroObitoResponse> Handle(CreateRegistroObitoCommand command, CancellationToken cancellationToken)
        {
            var response = new CreateRegistroObitoResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação do registro de óbito.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var animal = await animalRepository.GetByIdAsync(command.AnimalId);
            if (animal == null)
            {
                response.Success = false;
                response.Message = "Animal não encontrado.";
                return response;
            }

            var entity = mapper.Map<RegistroObito>(command);
            entity = await registroObitoRepository.AddAsync(entity);

            animal.SituacaoAnimal = Situacao.Obito;
            await animalRepository.UpdateAsync(animal);

            response.Id = entity.Id;
            response.RegistroObito = mapper.Map<CreateRegistroObitoDto>(entity);
            response.Message = "Registro de óbito cadastrado com sucesso e situação do animal atualizada para Óbito.";

            return response;
        }
    }
}
