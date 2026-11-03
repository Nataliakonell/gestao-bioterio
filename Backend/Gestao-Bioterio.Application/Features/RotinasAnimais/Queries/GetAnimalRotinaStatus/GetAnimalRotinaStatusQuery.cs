using MediatR;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAnimalRotinaStatus
{
    public class GetAnimalRotinaStatusQuery : IRequest<AnimalRotinaStatusVm>
    {
        public int AnimalId { get; set; }
    }
}
