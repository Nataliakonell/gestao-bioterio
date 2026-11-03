using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Groups.Command.CreateGroup
{
    public class CreateGroupCommandHandler(
        IGrupoRepository groupRepository,
        IValidator<CreateGrupoCommand> validator
    ) : IRequestHandler<CreateGrupoCommand, CreateGrupoResponse>
    {
        public async Task<CreateGrupoResponse> Handle(CreateGrupoCommand command, CancellationToken cancellationToken)
        {
            var response = new CreateGrupoResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);

            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = new List<string>();
                foreach (var error in validationResult.Errors)
                {
                    response.ValidationErrors.Add(error.ErrorMessage);
                }
                response.Message = "Erro na validação do grupo.";
                return response;
            }

            if (response.Success)
            {
                var grupo = new Grupo
                {
                    Nome = command.Nome
                };

                grupo = await groupRepository.AddAsync(grupo);

                response.Id = grupo.Id;
                response.Grupo = new CreateGrupoDto
                {
                    Id = grupo.Id,
                    Nome = grupo.Nome
                };
                response.Message = "Grupo cadastrado com sucesso!";
            }

            return response;
        }
    }
}
