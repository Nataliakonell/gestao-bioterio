using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.CreateAnimalLocalizacao
{
    public class CreateAnimalLocalizacaoValidator : AbstractValidator<CreateAnimalLocalizacaoCommand>
    {
        private readonly IAnimalRepository _animalRepository;
        private readonly ILocalizacaoRepository _localizacaoRepository;
        private readonly IAnimalLocalizacaoRepository _animalLocalizacaoRepository;

        public CreateAnimalLocalizacaoValidator(
            IAnimalRepository animalRepository,
            ILocalizacaoRepository localizacaoRepository,
            IAnimalLocalizacaoRepository animalLocalizacaoRepository)
        {
            _animalRepository = animalRepository;
            _localizacaoRepository = localizacaoRepository;
            _animalLocalizacaoRepository = animalLocalizacaoRepository;

            RuleFor(p => p.AnimalId)
                .GreaterThan(0).WithMessage("O identificador do animal é obrigatório.")
                .MustAsync(async (animalId, cancellation) =>
                {
                    var animal = await _animalRepository.GetByIdAsync(animalId);
                    return animal != null;
                })
                .WithMessage("O animal informado não existe.")
                .MustAsync(async (animalId, cancellation) =>
                {
                    var existente = await _animalLocalizacaoRepository.ObterPorAnimalIdAsync(animalId);
                    return existente == null;
                })
                .WithMessage("O animal já possui uma localização cadastrada.");

            RuleFor(p => p.LocalizacaoId)
                .GreaterThan(0).WithMessage("O identificador da localização é obrigatório.")
                .MustAsync(async (localizacaoId, cancellation) =>
                {
                    var localizacao = await _localizacaoRepository.GetByIdAsync(localizacaoId);
                    return localizacao != null;
                })
                .WithMessage("A localização informada não existe.");
        }
    }
}
