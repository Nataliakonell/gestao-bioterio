using MediatR;

namespace Gestao_Bioterio.Application.Features.Animais.Queries.GetAnimalLookup
{
    public class AnimalLookupVm
    {
        public int Id { get; set; }
        public string NumeroRegistro { get; set; } = string.Empty;
        public string EspecieNome { get; set; } = string.Empty;
        public decimal? Peso { get; set; }
    }

    public class GetAnimalLookupQuery : IRequest<List<AnimalLookupVm>> { }
}
