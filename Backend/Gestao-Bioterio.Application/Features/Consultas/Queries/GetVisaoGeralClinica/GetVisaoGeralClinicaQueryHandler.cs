using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Consultas.Queries.GetVisaoGeralClinica
{
    public class GetVisaoGeralClinicaQueryHandler(IConsultaRepository consultaRepository)
        : IRequestHandler<GetVisaoGeralClinicaQuery, VisaoGeralClinicaResponse>
    {
        public async Task<VisaoGeralClinicaResponse> Handle(GetVisaoGeralClinicaQuery request, CancellationToken cancellationToken)
        {
            return await consultaRepository.GetVisaoGeralClinicaAsync(request, cancellationToken);
        }
    }
}
