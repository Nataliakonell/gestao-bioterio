using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Application.Exceptions;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Consultas.Command.DeleteConsulta
{
    public class DeleteConsultaHandler(IConsultaRepository repository) : IRequestHandler<DeleteConsultaCommand>
    {
        public async Task Handle(DeleteConsultaCommand request, CancellationToken cancellationToken)
        {
            var entityToDelete = await repository.GetByIdAsync(request.Id);
            if (entityToDelete == null)
            {
                throw new NotFoundException(nameof(Consulta), request.Id);
            }
            await repository.DeleteAsync(entityToDelete);
        }
    }
}
