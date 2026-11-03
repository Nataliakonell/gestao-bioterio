using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.DeleteLiberacaoQuarentena
{
    public class DeleteLiberacaoQuarentenaHandler(ILiberacaoQuarentenaRepository liberacaoQuarentenaRepository) : IRequestHandler<DeleteLiberacaoQuarentenaCommand>
    {

        public async Task Handle(DeleteLiberacaoQuarentenaCommand c, CancellationToken cancellationToken)
        {
            var location = await liberacaoQuarentenaRepository.GetByIdAsync(c.Id);

            if (location == null)
                return;
            await liberacaoQuarentenaRepository.DeleteAsync(location);
        }
    }
}
    
