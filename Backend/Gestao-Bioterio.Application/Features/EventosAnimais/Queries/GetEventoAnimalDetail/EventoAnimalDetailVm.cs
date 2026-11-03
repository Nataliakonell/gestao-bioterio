using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.EventosAnimais.Queries.GetEventoAnimalDetail
{
    public class EventoAnimalDetailVm
    {
        public int Id { get; set; }
        public int EventoId { get; set; }
        public int AnimalId { get; set; }
        public string? AnimalNomePopular { get; set; }
        public string? AnimalNumeroRegistro { get; set; }
        public string? AnimalEspecieNome { get; set; }
    }
}
