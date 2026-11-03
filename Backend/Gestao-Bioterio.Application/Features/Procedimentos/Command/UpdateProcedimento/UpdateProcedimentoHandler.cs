using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Procedimentos.Command.UpdateProcedimento
{
    public class UpdateProcedimentoHandler(
        IMapper mapper,
        IProcedimentoRepository procedimentoRepository,
        IValidator<UpdateProcedimentoCommand> validator
    ) : IRequestHandler<UpdateProcedimentoCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateProcedimentoCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                return new BaseResponse("Erro na validação da atualização do procedimento.", false)
                {
                    ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList()
                };
            }

            var procedimento = await procedimentoRepository.GetByIdAsync(request.Id);
            if (procedimento == null)
                throw new NotFoundException(nameof(Procedimento), request.Id);

            mapper.Map(request, procedimento);
            await procedimentoRepository.UpdateAsync(procedimento);

            return new BaseResponse("Procedimento atualizado com sucesso!");
        }
    }
}