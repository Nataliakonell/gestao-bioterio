using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.LocaisOrigem.Command.CreateLocalOrigem
{
    public class CreateLocalOrigemHandler(
        IMapper mapper,
        ILocalOrigemRepository localOrigemRepository,
        IValidator<CreateLocalOrigemCommand> validator
    ) : IRequestHandler<CreateLocalOrigemCommand, CreateLocalOrigemResponse>
    {
        public async Task<CreateLocalOrigemResponse> Handle(CreateLocalOrigemCommand command, CancellationToken cancellationToken)
        {
            var response = new CreateLocalOrigemResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);

            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = new List<string>();
                foreach (var error in validationResult.Errors)
                {
                    response.ValidationErrors.Add(error.ErrorMessage);
                }
                response.Message = "Erro na validação do local de origem.";
                return response;
            }

            if (response.Success)
            {
                var localOrigem = mapper.Map<LocalOrigem>(command);
                localOrigem = await localOrigemRepository.AddAsync(localOrigem);

                response.Id = localOrigem.Id;
                response.LocalOrigem = mapper.Map<CreateLocalOrigemDto>(localOrigem);
                response.Message = "Local de origem cadastrado com sucesso!";
            }

            return response;
        }
    }
}
