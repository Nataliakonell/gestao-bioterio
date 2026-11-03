using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.Funcionalidade.Command.CreateFuncionalidade
{
    public class CreateFuncionalidadeHandler(
        IMapper mapper,
        IFuncionalidadeRepository repository,
        IValidator<CreateFuncionalidadeCommand> validator) 
        : IRequestHandler<CreateFuncionalidadeCommand, CreateFuncionalidadeResponse>
    {
        public async Task<CreateFuncionalidadeResponse> Handle(CreateFuncionalidadeCommand request, CancellationToken cancellationToken)
        {
            var response = new CreateFuncionalidadeResponse();
            var validationResult = await validator.ValidateAsync(request, cancellationToken);

            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var funcionalidade = mapper.Map<Domain.Entities.Funcionalidade>(request);
            funcionalidade = await repository.AddAsync(funcionalidade);

            response.Success = true;
            response.Id = funcionalidade.Id;
            response.Funcionalidade = mapper.Map<CreateFuncionalidadeDto>(funcionalidade);
            response.Message = "Funcionalidade criada com sucesso!";

            return response;
        }
    }
}
