using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Eventos.Command.CreateEvento
{
    public class CreateEventoValidator : AbstractValidator<CreateEventoCommand>
    {
        private readonly IAnimalRepository _animalRepository;

        public CreateEventoValidator(IAnimalRepository animalRepository)
        {
            _animalRepository = animalRepository;

            RuleFor(p => p.Nome)
                .NotEmpty().WithMessage("O nome do evento é obrigatório.")
                .MaximumLength(200).WithMessage("O nome do evento não pode exceder 200 caracteres.");

            RuleFor(p => p.TipoEvento)
                .IsInEnum().WithMessage("Tipo de evento inválido.");

            RuleFor(p => p.DataHoraInicio)
                .NotEmpty().WithMessage("A data/hora de início é obrigatória.");

            RuleFor(p => p.DataHoraPrevisaoRetorno)
                .GreaterThan(p => p.DataHoraInicio).WithMessage("A previsão de retorno deve ser posterior à data/hora de início.");

            RuleFor(p => p.Responsavel)
                .NotEmpty().WithMessage("O responsável pelo evento é obrigatório.")
                .MaximumLength(200).WithMessage("O nome do responsável não pode exceder 200 caracteres.");

            RuleFor(p => p.AnimalIds)
                .MustAsync(async (animalIds, ct) =>
                {
                    if (animalIds == null || !animalIds.Any()) return true;

                    foreach (var id in animalIds.Distinct())
                    {
                        var isVivo = await _animalRepository.IsAnimalVivoAsync(id, ct);
                        if (!isVivo) return false;
                    }
                    return true;
                })
                .WithMessage("Não é permitido agendar eventos com animais com situação 'Óbito' ou 'Reintroduzido'. Os eventos devem ser feitos apenas com animais VIVOS.");
        }
    }
}
