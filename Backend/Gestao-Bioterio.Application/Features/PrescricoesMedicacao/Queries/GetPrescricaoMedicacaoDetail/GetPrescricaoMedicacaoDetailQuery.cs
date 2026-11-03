using MediatR;

namespace Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Queries.GetPrescricaoMedicacaoDetail
{
    public class GetPrescricaoMedicacaoDetailQuery : IRequest<PrescricaoMedicacaoDetailVm>
    {
        public int Id { get; set; }
    }
}