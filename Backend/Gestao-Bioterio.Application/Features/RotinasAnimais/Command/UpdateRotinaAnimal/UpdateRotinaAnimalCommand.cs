using Gestao_Bioterio.Application.Features.RotinasAnimais.Command.CreateRotinaAnimal;
using Gestao_Bioterio.Domain.Entities;
using MediatR;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Command.UpdateRotinaAnimal
{
    public class UpdateRotinaAnimalCommand : IRequest<UpdateRotinaAnimalResponse>
    {
        public int EspecieId { get; set; }
        public TipoRotina TipoRotina { get; set; }
        public List<RotinaFaseConfig> Fases { get; set; } = new();
    }
}
