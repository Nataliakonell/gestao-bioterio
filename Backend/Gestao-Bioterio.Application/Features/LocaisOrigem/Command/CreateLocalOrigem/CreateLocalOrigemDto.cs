namespace Gestao_Bioterio.Application.Features.LocaisOrigem.Command.CreateLocalOrigem
{
    public class CreateLocalOrigemDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }
}
