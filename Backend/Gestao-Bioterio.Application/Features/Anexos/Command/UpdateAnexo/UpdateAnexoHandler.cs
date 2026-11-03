using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Anexos.Command.UpdateAnexo
{
    public class UpdateAnexoHandler(
        IMapper mapper,
        IAnexoRepository anexoRepository,
        IValidator<UpdateAnexoCommand> validator
    ) : IRequestHandler<UpdateAnexoCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateAnexoCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                return new BaseResponse("Erro na validação da atualização do anexo.", false)
                {
                    ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList()
                };
            }

            var anexo = await anexoRepository.GetByIdAsync(request.Id);
            if (anexo == null)
                throw new NotFoundException(nameof(Anexo), request.Id);

            mapper.Map(request, anexo);
            await anexoRepository.UpdateAsync(anexo);

            return new BaseResponse("Anexo atualizado com sucesso!");
        }
    }
}