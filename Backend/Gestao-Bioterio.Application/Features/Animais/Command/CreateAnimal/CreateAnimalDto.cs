namespace Gestao_Bioterio.Application.Features.Animais.Command.CreateAnimal
{
    public class CreateAnimalDto
    {
        public int Id { get; set; }
        public string NumeroRegistro { get; set; } = string.Empty;
        public string NomePopular { get; set; } = string.Empty;
    }
}
