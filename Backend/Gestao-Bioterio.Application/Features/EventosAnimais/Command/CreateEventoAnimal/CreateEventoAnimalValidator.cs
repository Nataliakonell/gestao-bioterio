using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.EventosAnimais.Command.CreateEventoAnimal
{
    public class CreateEventoAnimalValidator : AbstractValidator<CreateEventoAnimalCommand>
    {
        private readonly IEventoRepository _eventoRepository;
        private readonly IAnimalRepository _animalRepository;
        private readonly IEventoAnimalRepository _eventoAnimalRepository;

        public CreateEventoAnimalValidator(
            IEventoRepository eventoRepository,
            IAnimalRepository animalRepository,
            IEventoAnimalRepository eventoAnimalRepository)
        {
            _eventoRepository = eventoRepository;
            _animalRepository = animalRepository;
            _eventoAnimalRepository = eventoAnimalRepository;

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
                .MustAsync(async (animalId, ct) =>
                {
                    return await _animalRepository.IsAnimalVivoAsync(animalId, ct);
                })
                .WithMessage("Não é permitido incluir animais com situação 'Óbito' ou 'Reintroduzido'. Os eventos devem ser feitos apenas com animais VIVOS.")
                .MustAsync(async (cmd, animalId, ct) =>
                {
                    var vinculos = await _eventoAnimalRepository.ObterPorEventoIdAsync(cmd.EventoId);
                    return !vinculos.Any(v => v.AnimalId == animalId);
                })
                .WithMessage("Este animal já está vinculado a este evento.");
        }
    }
}
