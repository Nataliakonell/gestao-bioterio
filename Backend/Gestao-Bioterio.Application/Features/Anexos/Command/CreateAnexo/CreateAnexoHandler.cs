using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Anexos.Command.CreateAnexo
{
    public class CreateAnexoHandler(
        IMapper mapper,
        IAnexoRepository anexoRepository,
        IAnimalRepository animalRepository,
        Gestao_Bioterio.Application.Contracts.Infrastructure.IPortalExternalApiRepository portalExternalApiRepository,
        IValidator<CreateAnexoCommand> validator
    ) : IRequestHandler<CreateAnexoCommand, CreateAnexoResponse>
    {
        public async Task<CreateAnexoResponse> Handle(CreateAnexoCommand request, CancellationToken cancellationToken)
        {
            var response = new CreateAnexoResponse();

            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro na validação do cadastro de anexo.";
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            if (request.Arquivo != null && request.Arquivo.Length > 0)
            {
                var animal = await animalRepository.GetByIdAsync(request.AnimalId);
                if (animal == null)
                {
                    response.Success = false;
                    response.Message = "Animal não encontrado.";
                    return response;
                }

                if (string.IsNullOrWhiteSpace(request.NomeArquivoAnexo))
                {
                    request.NomeArquivoAnexo = request.Arquivo.FileName;
                }

                await portalExternalApiRepository.UploadArquivoAsync(animal.NumeroRegistro ?? animal.Id.ToString(), request.Arquivo, cancellationToken);
            }

            var anexo = new Anexo
            {
                AnimalId = request.AnimalId,
                NomeArquivoAnexo = request.NomeArquivoAnexo,
                Descricao = request.Descricao,
                Responsavel = request.Responsavel
            };

            anexo = await anexoRepository.AddAsync(anexo);

            response.Id = anexo.Id;
            response.Anexo = mapper.Map<CreateAnexoDto>(anexo);
            response.Message = "Anexo cadastrado com sucesso!";
            return response;
        }
    }
}