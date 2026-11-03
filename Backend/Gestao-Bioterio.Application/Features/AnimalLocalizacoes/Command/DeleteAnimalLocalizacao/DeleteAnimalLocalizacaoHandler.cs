using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.DeleteAnimalLocalizacao
{
    public class DeleteAnimalLocalizacaoHandler(IAnimalLocalizacaoRepository animalLocalizacaoRepository)
        : IRequestHandler<DeleteAnimalLocalizacaoCommand>
    {
        public async Task Handle(DeleteAnimalLocalizacaoCommand command, CancellationToken cancellationToken)
        {
            var entity = await animalLocalizacaoRepository.GetByIdAsync(command.Id);
            if (entity == null)
                return;

            await animalLocalizacaoRepository.DeleteAsync(entity);
        }
    }
}
