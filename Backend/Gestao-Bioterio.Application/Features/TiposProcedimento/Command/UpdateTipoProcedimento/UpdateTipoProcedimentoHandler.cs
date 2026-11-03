using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.TiposProcedimento.Command.UpdateTipoProcedimento
{
    public class UpdateTipoProcedimentoHandler(
        IMapper mapper,
        ITipoProcedimentoRepository repository,
        IValidator<UpdateTipoProcedimentoCommand> validator) : IRequestHandler<UpdateTipoProcedimentoCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateTipoProcedimentoCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                return new BaseResponse("Erro na validação da atualização.", false)
                {
                    ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList()
                };
            }

            var entity = await repository.GetByIdAsync(request.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(TipoProcedimento), request.Id);
            }

            mapper.Map(request, entity);
            await repository.UpdateAsync(entity);

            return new BaseResponse("Tipo de procedimento atualizado com sucesso.");
        }
    }
}
