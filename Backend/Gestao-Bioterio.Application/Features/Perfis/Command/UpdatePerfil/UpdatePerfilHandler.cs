using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Perfis.Command.UpdatePerfil
{
    public class UpdatePerfilHandler(IMapper mapper, 
        IPerfilRepository perfilRepository,
        IValidator<UpdatePerfilCommand> validator
    ) : IRequestHandler<UpdatePerfilCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdatePerfilCommand cmd, CancellationToken ct)
        {
            var response = new BaseResponse();
            var validationResult = await validator.ValidateAsync(cmd, ct);

            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var perfilToUpdate = await perfilRepository.GetByIdAsync(cmd.Id);
            if (perfilToUpdate == null)
            {
                throw new NotFoundException(nameof(Perfil), cmd.Id);
            }

            mapper.Map(cmd, perfilToUpdate, typeof(UpdatePerfilCommand), typeof(Perfil));
            await perfilRepository.UpdateAsync(perfilToUpdate);

            response.Success = true;
            response.Message = "Perfil atualizado com sucesso!";
            
            return response;
        }
    }
}
