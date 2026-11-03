using AutoMapper;
using Gestao_Bioterio.Application.Contracts.Persistence;
using MediatR;

namespace Gestao_Bioterio.Application.Features.Eventos.Queries.GetAllEvento
{
    public class GetAllEventoHandler(
        IMapper mapper,
        IEventoRepository eventoRepository,
        IEventoAnimalRepository eventoAnimalRepository
    ) : IRequestHandler<GetAllEventoQuery, List<EventoListVm>>
    {
        public async Task<List<EventoListVm>> Handle(GetAllEventoQuery request, CancellationToken cancellationToken)
        {
            var eventos = await eventoRepository.ListAllAsync();

            var vms = new List<EventoListVm>();
            foreach (var evento in eventos.OrderByDescending(e => e.DataHoraInicio))
            {
                var vm = mapper.Map<EventoListVm>(evento);
                var animaisDoEvento = await eventoAnimalRepository.ObterPorEventoIdAsync(evento.Id);
                vm.QuantidadeAnimais = animaisDoEvento.Count;
                vms.Add(vm);
            }

            return vms;
        }
    }
}
