using MediatR;

namespace Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Queries.GetAllPrescricoesMedicacao
{
    public class GetAllPrescricoesMedicacaoQuery : IRequest<List<PrescricaoMedicacaoListVm>>
    {
        public int? AnimalId { get; set; }
    }
}