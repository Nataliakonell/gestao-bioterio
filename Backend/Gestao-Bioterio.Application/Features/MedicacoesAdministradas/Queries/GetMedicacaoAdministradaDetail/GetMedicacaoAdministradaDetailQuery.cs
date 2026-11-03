using MediatR;

namespace Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Queries.GetMedicacaoAdministradaDetail
{
    public class GetMedicacaoAdministradaDetailQuery : IRequest<MedicacaoAdministradaDetailVm>
    {
        public int Id { get; set; }
    }
}