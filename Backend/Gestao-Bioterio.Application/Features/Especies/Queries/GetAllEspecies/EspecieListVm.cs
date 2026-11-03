namespace Gestao_Bioterio.Application.Features.Species.Queries.GetAllSpecies
{
    public class EspecieListVm
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string NomePopular { get; set; } = string.Empty;
        public string GrupoNome { get; set; } = string.Empty;
    }
}
