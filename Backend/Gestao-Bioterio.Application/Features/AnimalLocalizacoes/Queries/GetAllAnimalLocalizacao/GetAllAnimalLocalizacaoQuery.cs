using MediatR;

namespace Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Queries.GetAllAnimalLocalizacao
{
    public class GetAllAnimalLocalizacaoQuery : IRequest<List<AnimalLocalizacaoListVm>>
    {
    }
}
