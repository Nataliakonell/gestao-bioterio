namespace Gestao_Bioterio.Application.Features.Evolucoes.Queries.GetAllEvolucoes
{
    public class EvolucaoListVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public DateTime DataHoraRegistro { get; set; }
        public string Responsavel { get; set; } = string.Empty;
        public DateTime DataCriacao { get; set; }
        public string RF { get; set; } = string.Empty;
        public string NomeProfissional { get; set; } = string.Empty;
    }
}