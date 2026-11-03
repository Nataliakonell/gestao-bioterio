using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Groups.Command.UpdateGroup
{
    public class UpdateGrupoHandler(IGrupoRepository grupoRepository, IMapper mapper, IValidator<UpdateGrupoCommand> validator) : IRequestHandler<UpdateGrupoCommand>
    {
        public async Task Handle(UpdateGrupoCommand command, CancellationToken cancellationToken)
        {
            var grupoToUpdate = await grupoRepository.GetByIdAsync(command.Id);

            if (grupoToUpdate == null)
                throw new NotFoundException(nameof(Grupo), command.Id);

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (validationResult.Errors.Count > 0)
                throw new Exceptions.ValidationException(validationResult);

            grupoToUpdate.Nome = command.Nome ?? grupoToUpdate.Nome;

            await grupoRepository.UpdateAsync(grupoToUpdate);
        }
    }
}