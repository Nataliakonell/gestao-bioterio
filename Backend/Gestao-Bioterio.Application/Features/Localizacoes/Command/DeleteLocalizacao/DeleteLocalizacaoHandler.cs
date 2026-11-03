using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Localizacoes.Command.DeleteLocalizacao
{
    public class DeleteLocalizacaoHandler(ILocalizacaoRepository localizacaoRepository)
        : IRequestHandler<DeleteLocalizacaoCommand>
    {
        public async Task Handle(DeleteLocalizacaoCommand c, CancellationToken cancellationToken)
        {
            var localizacao = await localizacaoRepository.GetByIdAsync(c.Id);

            if (localizacao == null)
                return;

            await localizacaoRepository.DeleteAsync(localizacao);
        }
    }
}
