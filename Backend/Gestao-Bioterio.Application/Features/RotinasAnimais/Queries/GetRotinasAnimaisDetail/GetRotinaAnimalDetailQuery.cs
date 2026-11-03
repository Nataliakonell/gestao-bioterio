using MediatR;

namespace Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetRotinaAnimalDetail
{
    public class GetRotinaAnimalDetailQuery : IRequest<GetRotinaAnimalDetailVm>
    {
        public int Id { get; set; }
    }
}