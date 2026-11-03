using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.Eventos.Queries.GetEventoDetail
{
    public class EventoDetailVm
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public TipoEvento TipoEvento { get; set; }
        public string TipoEventoDescricao => TipoEvento.ToString();
        public DateTime DataHoraInicio { get; set; }
        public DateTime DataHoraPrevisaoRetorno { get; set; }
        public string Responsavel { get; set; } = string.Empty;
        public Status Status { get; set; }
        public string StatusDescricao => Status.ToString();
        public List<EventoAnimalItemVm> Animais { get; set; } = new();
    }

    public class EventoAnimalItemVm
    {
        public int Id { get; set; }
        public int AnimalId { get; set; }
        public string? AnimalNomePopular { get; set; }
        public string? AnimalNumeroRegistro { get; set; }
        public string? AnimalEspecieNome { get; set; }
    }
}
