using MediatR;

namespace Gestao_Bioterio.Application.Features.BiometriaAnimais.Command.DeleteBiometriaAnimal
{
    public class DeleteBiometriaAnimalCommand : IRequest
    {
        public int Id { get; set; }
    }
}
