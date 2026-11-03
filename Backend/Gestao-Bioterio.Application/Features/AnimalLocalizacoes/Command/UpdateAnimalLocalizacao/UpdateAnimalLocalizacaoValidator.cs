using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.UpdateAnimalLocalizacao
{
    public class UpdateAnimalLocalizacaoValidator : AbstractValidator<UpdateAnimalLocalizacaoCommand>
    {
        private readonly IAnimalRepository _animalRepository;
        private readonly ILocalizacaoRepository _localizacaoRepository;
        private readonly IAnimalLocalizacaoRepository _animalLocalizacaoRepository;

        public UpdateAnimalLocalizacaoValidator(
            IAnimalRepository animalRepository,
            ILocalizacaoRepository localizacaoRepository,
            IAnimalLocalizacaoRepository animalLocalizacaoRepository)
        {
            _animalRepository = animalRepository;
            _localizacaoRepository = localizacaoRepository;
            _animalLocalizacaoRepository = animalLocalizacaoRepository;

            RuleFor(p => p.Id)
                .GreaterThan(0).WithMessage("O identificador do vínculo é obrigatório.");

            RuleFor(p => p.AnimalId)
                .GreaterThan(0).WithMessage("O identificador do animal é obrigatório.")
                .MustAsync(async (animalId, cancellation) =>
                {
                    var animal = await _animalRepository.GetByIdAsync(animalId);
                    return animal != null;
                })
                .WithMessage("O animal informado não existe.")
                .MustAsync(async (cmd, animalId, cancellation) =>
                {
                    var existente = await _animalLocalizacaoRepository.ObterPorAnimalIdAsync(animalId);
                    return existente == null || existente.Id == cmd.Id;
                })
                .WithMessage("O animal informado já está vinculado a outro registro de localização.");

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
