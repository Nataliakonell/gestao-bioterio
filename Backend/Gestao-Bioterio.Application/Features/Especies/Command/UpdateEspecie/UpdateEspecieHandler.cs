using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Species.Command.UpdateSpecie
{
    public class UpdateEspecieHandler(IEspecieRepository specieRepository, IMapper mapper, IValidator<UpdateEspecieCommand> validator, IAnimalRepository animalRepository) : IRequestHandler<UpdateEspecieCommand>
    {
        public async Task Handle(UpdateEspecieCommand command, CancellationToken cancellationToken)
        {
            var specieToUpdate = await specieRepository.GetByIdAsync(command.Id);

            if (specieToUpdate == null)
                throw new NotFoundException(nameof(Especie), command.Id);

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (validationResult.Errors.Count > 0)
                throw new Exceptions.ValidationException(validationResult);

            bool nomePopularChanged = command.NomePopular != null && command.NomePopular != specieToUpdate.NomePopular;

            specieToUpdate.Nome = command.Nome ?? specieToUpdate.Nome;
            specieToUpdate.NomePopular = command.NomePopular ?? specieToUpdate.NomePopular;
            if (command.GrupoId > 0)
            {
                specieToUpdate.GrupoId = command.GrupoId;
            }

            await specieRepository.UpdateAsync(specieToUpdate);

            if (nomePopularChanged)
            {
                await animalRepository.UpdateNomePopularByEspecieIdAsync(command.Id, command.NomePopular!);
            }
        }
    }
}