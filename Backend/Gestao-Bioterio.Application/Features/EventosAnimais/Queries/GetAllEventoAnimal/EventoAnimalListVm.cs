using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.EventosAnimais.Queries.GetAllEventoAnimal
{
    public class EventoAnimalListVm
    {
        public int Id { get; set; }
        public int EventoId { get; set; }
        public int AnimalId { get; set; }
        public string? AnimalNomePopular { get; set; }
        public string? AnimalNumeroRegistro { get; set; }
        public string? AnimalEspecieNome { get; set; }
    }
}
