using MediatR;

namespace Gestao_Bioterio.Application.Features.BiometriaAnimais.Queries.GetBiometriaAnimalDetail
{
    public class GetBiometriaAnimalDetailQuery : IRequest<GetBiometriaAnimalDetailVm>
    {
        public int Id { get; set; }
    }
}
