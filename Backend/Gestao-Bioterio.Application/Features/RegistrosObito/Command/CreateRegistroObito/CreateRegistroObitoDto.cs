namespace Gestao_Bioterio.Application.Features.RegistrosObito.Command.CreateRegistroObito
{
    public class CreateRegistroObitoDto
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public DateTime DataObito { get; set; }
        public bool HouveNecropsia { get; set; }
        public string? Observacoes { get; set; }
    }
}
