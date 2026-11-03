using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.RegistrosObito.Command.UpdateRegistroObito
{
    public class UpdateRegistroObitoHandler(
        IMapper mapper,
        IRegistroObitoRepository repository,
        IValidator<UpdateRegistroObitoCommand> validator)
        : IRequestHandler<UpdateRegistroObitoCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateRegistroObitoCommand command, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação da atualização do registro de óbito.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var entity = await repository.GetByIdAsync(command.Id);
            if (entity == null)
            {
                response.Success = false;
                response.Message = "Registro de óbito não encontrado.";
                return response;
            }

            mapper.Map(command, entity);
            await repository.UpdateAsync(entity);

            response.Message = "Registro de óbito atualizado com sucesso.";
            return response;
        }
    }
}
