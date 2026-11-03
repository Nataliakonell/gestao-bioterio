using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Animais.Command.CreateAnimal
{
    public class CreateAnimalValidator : AbstractValidator<CreateAnimalCommand>
    {
        private readonly IAnimalRepository _animalRepository;
        private readonly IEspecieRepository _especieRepository;
        private readonly IInstalacaoBioterioRepository _instalacaoBioterioRepository;
        private readonly ILocalOrigemRepository _localOrigemRepository;

        public CreateAnimalValidator(
            IAnimalRepository animalRepository,
            IEspecieRepository especieRepository,
            IInstalacaoBioterioRepository instalacaoBioterioRepository,
            ILocalOrigemRepository localOrigemRepository
        )
        {
            _animalRepository = animalRepository;
            _especieRepository = especieRepository;
            _instalacaoBioterioRepository = instalacaoBioterioRepository;
            _localOrigemRepository = localOrigemRepository;

            RuleFor(p => p.NumeroRegistro)
                .NotEmpty().WithMessage("O número de registro é obrigatório.")
                .MustAsync(NumeroRegistroUnique).WithMessage("Um animal com este número de registro já existe.");

            RuleFor(p => p.NomePopular)
                .NotEmpty().WithMessage("O nome popular é obrigatório.");

            RuleFor(p => p.DataDeEntrada)
                .NotEmpty().WithMessage("A data de entrada é obrigatória.")
                .LessThanOrEqualTo(DateTime.Now).WithMessage("A data de entrada não pode ser uma data futura.");

            RuleFor(p => p.LocalOrigemId)
                .Cascade(CascadeMode.Stop)
                .GreaterThan(0).WithMessage("Selecione um local de origem válido.")
                .MustAsync(LocalOrigemExists).WithMessage("O local de origem informado não existe.");

            RuleFor(p => p.Municipio)
                .NotEmpty().WithMessage("O município é obrigatório.");

            RuleFor(p => p.EspecieId)
                .Cascade(CascadeMode.Stop)
                .GreaterThan(0).WithMessage("Selecione uma espécie válida.")
                .MustAsync(EspecieExists).WithMessage("A espécie informada não existe.");

            RuleFor(p => p.Genero)
                .NotEmpty().WithMessage("O gênero é obrigatório.");

            RuleFor(p => p.FaseDeVida)
                .NotEmpty().WithMessage("A fase de vida de entrada é obrigatória.");

            RuleFor(p => p.InstalacaoBioterioId)
                .Cascade(CascadeMode.Stop)
                .GreaterThan(0).WithMessage("Selecione uma localização válida.")
                .MustAsync(InstalacaoBioterioExists).WithMessage("A localização informada não existe.")
                .When(p => !p.LocalizacaoId.HasValue);

            RuleFor(p => p.NumeroChip)
                .NotEmpty().WithMessage("O número do chip é obrigatório.")
                .MustAsync(NumeroChipUnique).WithMessage("Um animal com este número de chip já existe.");
        }

        private async Task<bool> NumeroRegistroUnique(string numeroRegistro, CancellationToken cancellationToken)
        {
            return await _animalRepository.NumeroRegistroIsUnique(numeroRegistro);
        }

        private async Task<bool> NumeroChipUnique(string numeroChip, CancellationToken cancellationToken)
        {
            return await _animalRepository.NumeroChipIsUnique(numeroChip);
        }

        private async Task<bool> EspecieExists(int especieId, CancellationToken cancellationToken)
        {
            return await _especieRepository.GetByIdAsync(especieId) != null;
        }

        private async Task<bool> InstalacaoBioterioExists(int instalacaoBioterioId, CancellationToken cancellationToken)
        {
            return await _instalacaoBioterioRepository.GetByIdAsync(instalacaoBioterioId) != null;
        }

        private async Task<bool> LocalOrigemExists(int localOrigemId, CancellationToken cancellationToken)
        {
            return await _localOrigemRepository.GetByIdAsync(localOrigemId) != null;
        }
    }
}
