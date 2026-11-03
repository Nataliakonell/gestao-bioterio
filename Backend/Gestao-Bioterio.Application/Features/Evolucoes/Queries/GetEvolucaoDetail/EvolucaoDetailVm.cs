namespace Gestao_Bioterio.Application.Features.Evolucoes.Queries.GetEvolucaoDetail
{
    public class EvolucaoDetailVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public DateTime DataHoraRegistro { get; set; }
        public string Responsavel { get; set; } = string.Empty;
    }
}