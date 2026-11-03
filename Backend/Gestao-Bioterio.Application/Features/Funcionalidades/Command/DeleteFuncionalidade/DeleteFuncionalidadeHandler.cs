using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.Perfis.Command.DeletePerfil;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Funcionalidade.Command.DeleteFuncionalidade
{
    public class DeleteFuncionalidadeHandler (IFuncionalidadeRepository funcionalidadeRepository) : IRequestHandler<DeleteFuncionalidadeCommand>
    {
        public async Task Handle(DeleteFuncionalidadeCommand cmd, CancellationToken ct)
        {
            var funcionalidadeToDelete = await funcionalidadeRepository.GetByIdAsync(cmd.Id);
            if (funcionalidadeToDelete == null)
            {
                throw new NotFoundException(nameof(Funcionalidade), cmd.Id);
            }

            try
            {
                await funcionalidadeRepository.DeleteAsync(funcionalidadeToDelete);
            }
            catch (System.Exception ex) when (ex.InnerException?.Message.Contains("REFERENCE") == true || ex.InnerException?.Message.Contains("FK_PerfilPermissao") == true)
            {
                throw new BadRequestException("Esta funcionalidade não pode ser excluída pois está vinculada a um ou mais perfis. Remova as permissões antes de excluir.");
            }
        }
    }
}
