using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Gestao_Bioterio.Application.Responses;

namespace Gestao_Bioterio.Application.Features.Funcionalidade.Command.UpdateFuncionalidade
{
    public class UpdateFuncionalidadeHandler(
        IMapper mapper,
        IFuncionalidadeRepository repository,
        IValidator<UpdateFuncionalidadeCommand> validator) 
        : IRequestHandler<UpdateFuncionalidadeCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateFuncionalidadeCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();
            var validationResult = await validator.ValidateAsync(request, cancellationToken);

            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var funcionalidade = await repository.GetByIdAsync(request.Id);

            if (funcionalidade == null)
            {
                response.Success = false;
                response.Message = "Funcionalidade não encontrada.";
                return response;
            }

            mapper.Map(request, funcionalidade);
            await repository.UpdateAsync(funcionalidade);

            response.Success = true;
            response.Message = "Funcionalidade atualizada com sucesso!";

            return response;
        }
    }
}
