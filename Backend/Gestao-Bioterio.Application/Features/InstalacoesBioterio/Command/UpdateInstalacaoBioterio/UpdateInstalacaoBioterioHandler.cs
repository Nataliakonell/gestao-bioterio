using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using AppValidationException = Gestao_Bioterio.Application.Exceptions.ValidationException;

namespace Gestao_Bioterio.Application.Features.InstalacoesBioterio.Command.UpdateInstalacaoBioterio
{
    public class UpdateInstalacaoBioterioHandler(IInstalacaoBioterioRepository instalacaoBioterioRepository, IMapper mapper, IValidator<UpdateInstalacaoBioterioCommand> validator) : IRequestHandler<UpdateInstalacaoBioterioCommand>
    {
        public async Task Handle(UpdateInstalacaoBioterioCommand command, CancellationToken cancellationToken)
        {
            var locationToUpdate = await instalacaoBioterioRepository.GetByIdAsync(command.Id);

            if (locationToUpdate == null)
                throw new NotFoundException(nameof(InstalacaoBioterio), command.Id);

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (validationResult.Errors.Count > 0)
                throw new Exceptions.ValidationException(validationResult);

            locationToUpdate.Nome = command.Nome ?? locationToUpdate.Nome;

            await instalacaoBioterioRepository.UpdateAsync(locationToUpdate);
        }
    }
}
