using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.InstalacoesBioterio.Command.CreateInstalacaoBioterio
{
    public class CreateLocationCommandHandler(
        IMapper mapper,
        IInstalacaoBioterioRepository locationRepository,
        IValidator<CreateInstalacaoBioterioCommand> validator
    ) : IRequestHandler<CreateInstalacaoBioterioCommand, CreateInstalacaoBioterioResponse>
    {
        public async Task<CreateInstalacaoBioterioResponse> Handle(CreateInstalacaoBioterioCommand command, CancellationToken cancellationToken)
        {
            var response = new CreateInstalacaoBioterioResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);

            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = new List<string>();
                foreach (var error in validationResult.Errors)
                {
                    response.ValidationErrors.Add(error.ErrorMessage);
                }
                response.Message = "Erro na validação da instalação.";
                return response;
            }

            if (response.Success)
            {
                var location = mapper.Map<InstalacaoBioterio>(command);

                location = await locationRepository.AddAsync(location);

                response.Id = location.Id;
                response.InstalacaoBioterio = mapper.Map<CreateInstalacaoBioterioDto>(location);
                response.Message = "Instalação cadastrada com sucesso!";
            }

            return response;
        }
    }
}
