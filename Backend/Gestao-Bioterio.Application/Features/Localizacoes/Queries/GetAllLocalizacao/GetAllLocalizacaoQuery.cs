using MediatR;

namespace Gestao_Bioterio.Application.Features.Localizacoes.Queries.GetAllLocalizacao
{
    public class GetAllLocalizacaoQuery : IRequest<List<LocalizacaoListVm>>
    {
    }
}
