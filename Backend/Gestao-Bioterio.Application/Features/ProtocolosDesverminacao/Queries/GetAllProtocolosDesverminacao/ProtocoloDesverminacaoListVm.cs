using Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Queries.GetProtocoloDesverminacaoDetail;

namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Queries.GetAllProtocolosDesverminacao
{
    public class ProtocoloDesverminacaoListVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string NumeroRegistro { get; set; } = string.Empty;
        public string EspecieNome { get; set; } = string.Empty;
        public DateTime DataEntrada { get; set; }
        public string StatusProtocolo { get; set; } = string.Empty;
        public bool CicloInicialConcluido { get; set; }
        public DateTime? DataProximaDose { get; set; }
        public List<DoseDesverminacaoVm> Doses { get; set; } = new List<DoseDesverminacaoVm>();
    }
}