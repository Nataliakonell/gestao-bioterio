using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.DocumentosEventos.Command.UpdateDocumentoEvento
{
    public class UpdateDocumentoEventoHandler(
        IDocumentoEventoRepository documentoEventoRepository,
        IValidator<UpdateDocumentoEventoCommand> validator
    ) : IRequestHandler<UpdateDocumentoEventoCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateDocumentoEventoCommand command, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (!validationResult.IsValid)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro na validação da atualização do documento do evento.";
                return response;
            }

            var entity = await documentoEventoRepository.GetByIdAsync(command.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(DocumentoEvento), command.Id);
            }

            entity.EventoId = command.EventoId;
            entity.ModeloDocumentoId = command.ModeloDocumentoId;
            entity.ConteudoDadosJson = command.ConteudoDadosJson;

            await documentoEventoRepository.UpdateAsync(entity);

            response.Success = true;
            response.Message = "Documento do evento atualizado com sucesso!";
            return response;
        }
    }
}
