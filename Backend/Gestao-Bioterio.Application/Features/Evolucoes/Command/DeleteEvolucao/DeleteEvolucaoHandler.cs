using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Evolucoes.Command.DeleteEvolucao
{
    public class DeleteEvolucaoHandler(
        IEvolucaoRepository evolucaoRepository
    ) : IRequestHandler<DeleteEvolucaoCommand>
    {
        public async Task Handle(DeleteEvolucaoCommand request, CancellationToken cancellationToken)
        {
            var evolucao = await evolucaoRepository.GetByIdAsync(request.Id);

            if (evolucao == null)
                throw new NotFoundException(nameof(Evolucao), request.Id);

            await evolucaoRepository.DeleteAsync(evolucao);
        }
    }
}