using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Command.DeleteMovimentacaoAnimal
{
    public class DeleteMovimentacaoAnimalHandler(IMovimentacaoAnimalRepository movimentacaoAnimalRepository)
        : IRequestHandler<DeleteMovimentacaoAnimalCommand>
    {
        public async Task Handle(DeleteMovimentacaoAnimalCommand command, CancellationToken cancellationToken)
        {
            var entity = await movimentacaoAnimalRepository.GetByIdAsync(command.Id);
            if (entity == null)
                return;

            await movimentacaoAnimalRepository.DeleteAsync(entity);
        }
    }
}
