using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Consultas.Command.UpdateConsulta
{
    public class UpdateConsultaHandler(
        IMapper mapper,
        IConsultaRepository repository,
        IValidator<UpdateConsultaCommand> validator) : IRequestHandler<UpdateConsultaCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateConsultaCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();
            var validation = await validator.ValidateAsync(request, cancellationToken);
            if (validation.Errors.Count > 0)
            {
                response.Success = false;
                response.Message = "Erro ao atualizar consulta.";
                response.ValidationErrors = validation.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var entityToUpdate = await repository.GetByIdAsync(request.Id);
            if (entityToUpdate == null)
            {
                throw new NotFoundException(nameof(Consulta), request.Id);
            }

            mapper.Map(request, entityToUpdate, typeof(UpdateConsultaCommand), typeof(Consulta));
            await repository.UpdateAsync(entityToUpdate);

            response.Message = "Consulta atualizada com sucesso!";
            return response;
        }
    }
}
