using MediatR;

namespace Gestao_Bioterio.Application.Features.Localizacoes.Queries.GetLocalizacaoDetail
{
    public class GetLocalizacaoDetailQuery : IRequest<LocalizacaoDetailVm?>
    {
        public int Id { get; set; }
    }
}
