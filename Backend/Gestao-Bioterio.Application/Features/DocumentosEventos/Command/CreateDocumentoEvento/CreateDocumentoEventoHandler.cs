using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.DocumentosEventos.Command.CreateDocumentoEvento
{
    public class CreateDocumentoEventoHandler(
        IMapper mapper,
        IDocumentoEventoRepository documentoEventoRepository,
        IValidator<CreateDocumentoEventoCommand> validator
    ) : IRequestHandler<CreateDocumentoEventoCommand, CreateDocumentoEventoResponse>
    {
        public async Task<CreateDocumentoEventoResponse> Handle(CreateDocumentoEventoCommand command, CancellationToken cancellationToken)
        {
            var response = new CreateDocumentoEventoResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (!validationResult.IsValid)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro na validação da geração do documento do evento.";
                return response;
            }

            var entity = mapper.Map<DocumentoEvento>(command);
            entity = await documentoEventoRepository.AddAsync(entity);

            response.Success = true;
            response.Id = entity.Id;
            response.DocumentoEvento = mapper.Map<CreateDocumentoEventoDto>(entity);
            response.Message = "Documento do evento gerado com sucesso!";

            return response;
        }
    }
}
