using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.Usuarios.Command.CreateUsuario;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Perfis.Command.CreatePerfil
{
    public class CreatePerfilHandler (IMapper mapper, 
        IPerfilRepository perfilRepository, 
        IValidator<CreatePerfilCommand> validator
    ) : IRequestHandler<CreatePerfilCommand, CreatePerfilResponse>

    {
        public async Task<CreatePerfilResponse> Handle(CreatePerfilCommand cmd, CancellationToken ct)
        {
            var response = new CreatePerfilResponse();
            var validationResult = await validator.ValidateAsync(cmd, ct);

            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var perfil = mapper.Map<Perfil>(cmd);
            perfil = await perfilRepository.AddAsync(perfil);

            response.Success = true;
            response.Id = perfil.Id;
            response.Perfil = mapper.Map<CreatePerfilDto>(perfil);
            response.Message = "Perfil cadastrado com sucesso!";

            return response;
        }
    }
}
