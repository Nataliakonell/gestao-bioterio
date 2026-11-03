using MediatR;

namespace Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Queries.GetAllMedicacoesAdministradas
{
    public class GetAllMedicacoesAdministradasQuery : IRequest<List<MedicacaoAdministradaListVm>>
    {
        public int? AnimalId { get; set; }
        public int? PrescricaoMedicacaoId { get; set; }
        public DateTime? Data { get; set; }
    }
}