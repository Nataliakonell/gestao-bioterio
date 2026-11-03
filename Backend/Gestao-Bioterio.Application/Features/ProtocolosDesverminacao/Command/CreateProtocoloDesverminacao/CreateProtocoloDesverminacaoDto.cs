namespace Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Command.CreateProtocoloDesverminacao
{
    public class CreateProtocoloDesverminacaoDto
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public DateTime DataEntrada { get; set; }
        public string StatusProtocolo { get; set; } = string.Empty;
        public bool CicloInicialConcluido { get; set; }
        public DateTime? DataConclusaoCicloInicial { get; set; }
        public DateTime? DataProximaDose { get; set; }
    }
}