using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Eventos.Command.UpdateEvento
{
    public class UpdateEventoHandler(
        IEventoRepository eventoRepository,
        IValidator<UpdateEventoCommand> validator
    ) : IRequestHandler<UpdateEventoCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateEventoCommand command, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var validationResult = await validator.ValidateAsync(command, cancellationToken);
            if (!validationResult.IsValid)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                response.Message = "Erro na validação da atualização do evento.";
                return response;
            }

            var entity = await eventoRepository.GetByIdAsync(command.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(Evento), command.Id);
            }

            entity.Nome = command.Nome;
            entity.TipoEvento = command.TipoEvento;
            entity.DataHoraInicio = command.DataHoraInicio;
            entity.DataHoraPrevisaoRetorno = command.DataHoraPrevisaoRetorno;
            entity.Responsavel = command.Responsavel;
            entity.Status = command.Status;

            await eventoRepository.UpdateAsync(entity);

            response.Success = true;
            response.Message = "Evento atualizado com sucesso!";
            return response;
        }
    }
}
