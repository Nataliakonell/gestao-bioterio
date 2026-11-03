using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.LocaisOrigem.Command.UpdateLocalOrigem
{
    public class UpdateLocalOrigemHandler(
        IMapper mapper,
        ILocalOrigemRepository localOrigemRepository,
        IValidator<UpdateLocalOrigemCommand> validator
    ) : IRequestHandler<UpdateLocalOrigemCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateLocalOrigemCommand command, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

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

            var localOrigemToUpdate = await localOrigemRepository.GetByIdAsync(command.Id);

            if (localOrigemToUpdate == null)
            {
                response.Success = false;
                response.Message = "Local de origem não encontrado.";
                return response;
            }

            mapper.Map(command, localOrigemToUpdate, typeof(UpdateLocalOrigemCommand), typeof(LocalOrigem));

            await localOrigemRepository.UpdateAsync(localOrigemToUpdate);

            response.Message = "Local de origem atualizado com sucesso!";

            return response;
        }
    }
}
