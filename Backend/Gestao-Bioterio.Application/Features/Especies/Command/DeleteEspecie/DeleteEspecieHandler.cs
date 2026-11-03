using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Features.Especies.Command.DeleteEspecie;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Species.Command.DeleteSpecie
{
    public class DeleteEspecieHandler(IEspecieRepository specieRepository) : IRequestHandler<DeleteEspecieCommand>
    {
        public async Task Handle(DeleteEspecieCommand c, CancellationToken cancellationToken)
        {
            var specie = await specieRepository.GetByIdAsync(c.Id);

            if (specie == null)
                return;
            await specieRepository.DeleteAsync(specie);
        }
    }
}