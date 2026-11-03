using AutoMapper;
using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Responses;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Usuarios.Command.UpdateUsuario
{
    public class UpdateUsuarioHandler(
        IMapper mapper,
        IUsuarioRepository usuarioRepository,
        IValidator<UpdateUsuarioCommand> validator
    ) : IRequestHandler<UpdateUsuarioCommand, BaseResponse>
    {
        public async Task<BaseResponse> Handle(UpdateUsuarioCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (validationResult.Errors.Count > 0)
            {
                return new BaseResponse("Erro na validação da atualização do usuário.", false)
                {
                    ValidationErrors = validationResult.Errors.Select(e => e.ErrorMessage).ToList()
                };
            }

            var dadosExternos = await usuarioRepository.BuscarDadosExternosPorRfAsync(request.RF);
            if (dadosExternos == null)
            {
                return new BaseResponse("RF inválido ou funcionário não encontrado no sistema legado.", false)
                {
                    ValidationErrors = new List<string> { "RF inválido ou funcionário não encontrado no sistema legado." }
                };
            }

            var usuarioToUpdate = await usuarioRepository.GetByIdAsync(request.Id);
            if (usuarioToUpdate == null)
                throw new NotFoundException(nameof(Usuario), request.Id);

            mapper.Map(request, usuarioToUpdate);
            
            // Força a atualização com os dados mais recentes do sistema legado
            usuarioToUpdate.Nome = dadosExternos.Nome;
            usuarioToUpdate.Email = dadosExternos.Email;

            await usuarioRepository.UpdateAsync(usuarioToUpdate);

            return new BaseResponse("Usuário atualizado com sucesso!");
        }
    }
}
