using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.EventosAnimais.Command.UpdateEventoAnimal
{
    public class UpdateEventoAnimalValidator : AbstractValidator<UpdateEventoAnimalCommand>
    {
        private readonly IEventoRepository _eventoRepository;
        private readonly IAnimalRepository _animalRepository;
        private readonly IEventoAnimalRepository _eventoAnimalRepository;

        public UpdateEventoAnimalValidator(
            IEventoRepository eventoRepository,
            IAnimalRepository animalRepository,
            IEventoAnimalRepository eventoAnimalRepository)
        {
            _eventoRepository = eventoRepository;
            _animalRepository = animalRepository;
            _eventoAnimalRepository = eventoAnimalRepository;

            RuleFor(p => p.Id)
                .GreaterThan(0).WithMessage("O identificador do vínculo é obrigatório.");

            RuleFor(p => p.EventoId)
                .GreaterThan(0).WithMessage("O identificador do evento é obrigatório.")
                .MustAsync(async (eventoId, ct) =>
                {
                    var evento = await _eventoRepository.GetByIdAsync(eventoId);
                    return evento != null;
                })
                .WithMessage("O evento informado não existe.");

            RuleFor(p => p.AnimalId)
                .GreaterThan(0).WithMessage("O identificador do animal é obrigatório.")
                .MustAsync(async (animalId, ct) =>
                {
                    var animal = await _animalRepository.GetByIdAsync(animalId);
                    return animal != null;
                })
                .WithMessage("O animal informado não existe.")
                .MustAsync(async (cmd, animalId, ct) =>
                {
                    var vinculos = await _eventoAnimalRepository.ObterPorEventoIdAsync(cmd.EventoId);
                    return !vinculos.Any(v => v.AnimalId == animalId && v.Id != cmd.Id);
                })
                .WithMessage("Este animal já está vinculado a este evento.");
        }
    }
}
