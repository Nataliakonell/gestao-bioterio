using MediatR;

namespace Gestao_Bioterio.Application.Features.InstalacoesBioterio.Queries.GetAllInstalacaoBioterio
{

    public class GetAllInstalacaoBioterioQuery : IRequest<List<InstalacaoBioterioListVm>>
    {
    }
}

