using MediatR;

namespace Gestao_Bioterio.Application.Features.Animais.Command.DeleteAnimal
{
    public class DeleteAnimalCommand : IRequest
    {
        public int Id { get; set; }
    }
}
