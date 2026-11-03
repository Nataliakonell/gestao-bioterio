namespace Gestao_Bioterio.Application.Features.Species.Command.CreateSpecie
{
    public class CreateEspecieDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string NomePopular { get; set; } = string.Empty;
        public int GrupoId { get; set; }
    }
}