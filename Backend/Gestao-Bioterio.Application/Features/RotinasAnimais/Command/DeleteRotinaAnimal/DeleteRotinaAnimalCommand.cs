using MediatR;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Command.DeleteRotinaAnimal
{
    public class DeleteRotinaAnimalCommand : IRequest
    {
        public int Id { get; set; }
    }
}
