using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.TiposProcedimento.Command.CreateTipoProcedimento
{
    public class CreateTipoProcedimentoHandler(ITipoProcedimentoRepository repository, IMapper mapper, IValidator<CreateTipoProcedimentoCommand> validator) 
        : IRequestHandler<CreateTipoProcedimentoCommand, CreateTipoProcedimentoResponse>
    {
        public async Task<CreateTipoProcedimentoResponse> Handle(CreateTipoProcedimentoCommand request, CancellationToken cancellationToken)
        {
            var response = new CreateTipoProcedimentoResponse();
            var validationResult = await validator.ValidateAsync(request, cancellationToken);

            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                response.Message = "Erro ao validar o tipo de procedimento.";
                return response;
            }

            var entity = mapper.Map<TipoProcedimento>(request);
            entity = await repository.AddAsync(entity);

            response.Id = entity.Id;
            response.TipoProcedimento = mapper.Map<CreateTipoProcedimentoDto>(entity);
            response.Message = "Tipo de procedimento criado com sucesso.";

            return response;
        }
    }
}
