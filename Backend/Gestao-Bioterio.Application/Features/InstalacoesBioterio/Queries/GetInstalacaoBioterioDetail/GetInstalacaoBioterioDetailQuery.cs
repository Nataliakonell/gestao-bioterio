using Gestao_Bioterio.Application.Features.InstalacoesBioterio.Queries.GetInstalacaoBioterioDetail;
using MediatR;

namespace Gestao_Bioterio.Application.Features.InstalacoesBioterio.Queries
{
    public class GetInstalacaoBioterioDetailQuery: IRequest<GetInstalacaoBioterioDetailVm>
    {
        public int Id { get; set; }
    }
}


