using MediatR;

namespace Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Queries.GetAllDosesAplicacaoDesverminacao
{
    public class GetAllDosesAplicacaoDesverminacaoQuery : IRequest<List<DoseAplicacaoDesverminacaoListVm>>
    {
        public int? ProtocoloDesverminacaoId { get; set; }
        public int? AnimalId { get; set; }
        public DateTime? Data { get; set; }
    }
}