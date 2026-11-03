using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Species.Command.CreateSpecie
{
    public class CreateSpecieCommandHandler(
        IMapper mapper,
        IEspecieRepository specieRepository,
        IValidator<CreateEspecieCommand> validator
    ) : IRequestHandler<CreateEspecieCommand, CreateEspecieResponse>
    {
        public async Task<CreateEspecieResponse> Handle(CreateEspecieCommand command, CancellationToken cancellationToken)
        {
            var response = new CreateEspecieResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);

            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = new List<string>();
                foreach (var error in validationResult.Errors)
                {
                    response.ValidationErrors.Add(error.ErrorMessage);
                }
                response.Message = "Erro na validação da espécie.";
                return response;
            }

            if (response.Success)
            {
                var specie = mapper.Map<Especie>(command);

                specie = await specieRepository.AddAsync(specie);

                response.Id = specie.Id;
                response.Specie = mapper.Map<CreateEspecieDto>(specie);
                response.Message = "Espécie cadastrada com sucesso!";
            }

            return response;
        }
    }
}