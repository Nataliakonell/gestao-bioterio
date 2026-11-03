using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.InstalacoesBioterio.Command.DeleteInstalacaoBioterio
{
    public class DeleteInstalacaoBioterioHandler(IInstalacaoBioterioRepository instalacaoBioterioRepository) : IRequestHandler<DeleteLiberacaoQuarentenaCommand>
    {
        public async Task Handle(DeleteLiberacaoQuarentenaCommand c, CancellationToken cancellationToken)
        {
            var location = await instalacaoBioterioRepository.GetByIdAsync(c.Id);

            if (location == null)
                return;
            await instalacaoBioterioRepository.DeleteAsync(location);
        }
    }
}

