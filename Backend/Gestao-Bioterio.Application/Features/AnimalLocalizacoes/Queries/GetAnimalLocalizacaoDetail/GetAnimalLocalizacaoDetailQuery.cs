using MediatR;

namespace Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Queries.GetAnimalLocalizacaoDetail
{
    public class GetAnimalLocalizacaoDetailQuery : IRequest<AnimalLocalizacaoDetailVm?>
    {
        public int Id { get; set; }
    }
}
