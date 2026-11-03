using MediatR;

namespace Gestao_Bioterio.Application.Features.Consultas.Queries.GetConsultaDetail
{
    public class GetConsultaDetailQuery : IRequest<ConsultaDetailVm?>
    {
        public int Id { get; set; }
    }
}
