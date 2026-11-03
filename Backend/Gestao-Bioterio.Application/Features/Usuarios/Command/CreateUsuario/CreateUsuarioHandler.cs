using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Usuarios.Command.CreateUsuario
{
    public class CreateUsuarioHandler(
        IMapper mapper,
        IUsuarioRepository usuarioRepository,
        IValidator<CreateUsuarioCommand> validator
    ) : IRequestHandler<CreateUsuarioCommand, CreateUsuarioResponse>
    {
        public async Task<CreateUsuarioResponse> Handle(CreateUsuarioCommand cmd, CancellationToken ct)
        {
            var response = new CreateUsuarioResponse();
            var validationResult = await validator.ValidateAsync(cmd, ct);

            if (validationResult.Errors.Count > 0)
            {
                response.Success = false;
                response.ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return response;
            }

            var dadosExternos = await usuarioRepository.BuscarDadosExternosPorRfAsync(cmd.RF);
            if (dadosExternos == null)
            {
                response.Success = false;
                response.ValidationErrors = new List<string> { "RF inválido ou funcionário não encontrado no sistema legado." };
                return response;
            }

            var usuario = mapper.Map<Usuario>(cmd);
            usuario.Nome = dadosExternos.Nome;
            usuario.Email = dadosExternos.Email;

            usuario = await usuarioRepository.AddAsync(usuario);

            response.Success = true;
            response.Id = usuario.Id;
            response.Usuario = mapper.Map<CreateUsuarioDto>(usuario);
            response.Message = "Usuário cadastrado com sucesso!";

            return response;
        }
    }
}
