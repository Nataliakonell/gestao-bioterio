using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ModelosDocumento.Command.UpdateModeloDocumento
{
    public class UpdateModeloDocumentoHandler(
        IMapper mapper,
        IModeloDocumentoRepository repository,
        IValidator<UpdateModeloDocumentoCommand> validator)
        : IRequestHandler<UpdateModeloDocumentoCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateModeloDocumentoCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();
            var validationResult = await validator.ValidateAsync(request, cancellationToken);

            if (!validationResult.IsValid)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro ao atualizar modelo de documento.";
                return response;
            }

            var modelo = await repository.GetByIdAsync(request.Id);

            if (modelo == null)
            {
                response.Success = false;
                response.Message = "Modelo não encontrado.";
                return response;
            }

            mapper.Map(request, modelo);
            await repository.UpdateAsync(modelo);

            response.Message = "Modelo atualizado com sucesso!";
            return response;
        }
    }
}
