using MediatR;

namespace Gestao_Bioterio.Application.Features.Animais.Queries.GetAnimalDetail
{
    public class GetAnimalDetailQuery: IRequest<RotinaAnimalDetailVm>
    {
        public int Id { get; set; }
    }
}
