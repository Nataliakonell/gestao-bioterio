using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.ModelosDocumento.Command.CreateModeloDocumento
{
    public class CreateModeloDocumentoHandler(
        IMapper mapper,
        IModeloDocumentoRepository repository,
        IValidator<CreateModeloDocumentoCommand> validator)
        : IRequestHandler<CreateModeloDocumentoCommand, CreateModeloDocumentoResponse>
    {
        public async Task<CreateModeloDocumentoResponse> Handle(CreateModeloDocumentoCommand request, CancellationToken cancellationToken)
        {
            var response = new CreateModeloDocumentoResponse();
            var validationResult = await validator.ValidateAsync(request, cancellationToken);

            if (!validationResult.IsValid)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro ao cadastrar modelo de documento.";
                return response;
            }

            var modelo = mapper.Map<ModeloDocumento>(request);
            modelo = await repository.AddAsync(modelo);

            response.Id = modelo.Id;
            response.ModeloDocumento = mapper.Map<CreateModeloDocumentoDto>(modelo);
            response.Message = "Modelo de documento criado com sucesso!";

            return response;
        }
    }
}
