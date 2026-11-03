using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.Animais.Command.UpdateAnimal
{
    public class UpdateAnimalValidator : AbstractValidator<UpdateAnimalCommand>
    {
        private readonly IAnimalRepository _animalRepository;
        private readonly IEspecieRepository _especieRepository;
        private readonly IInstalacaoBioterioRepository _instalacaoBioterioRepository;
        private readonly ILocalOrigemRepository _localOrigemRepository;

        public UpdateAnimalValidator(
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
            RuleFor(p => p.Id)
                .GreaterThan(0).WithMessage("O ID do animal é obrigatório para a atualização.");

            RuleFor(p => p.NomePopular)
                .MaximumLength(100).WithMessage("O nome popular não deve exceder 100 caracteres.")
                .When(p => !string.IsNullOrEmpty(p.NomePopular));


            RuleFor(p => p.NumeroRegistro)
                .NotEmpty().WithMessage("O número de registro não pode ser removido.")
                .When(p => p.NumeroRegistro != null)
                .MustAsync(NumeroRegistroUnique).WithMessage("Um animal com este número de registro já existe.");

            RuleFor(p => p.NumeroChip)
                .NotEmpty().WithMessage("O número do chip não pode ser removido.")
                .MaximumLength(50).WithMessage("O número do chip não deve exceder 50 caracteres.")
                .When(p => p.NumeroChip != null)
                .MustAsync(NumeroChipUnique).WithMessage("Um animal com este número de chip já existe.");

            RuleFor(p => p.Peso)
                .NotEmpty().WithMessage("A massa é obrigatória para manter o histórico.")
                .When(p => p.Peso != null);

            RuleFor(p => p.EspecieId)
                .Cascade(CascadeMode.Stop)
                .GreaterThan(0).WithMessage("Selecione uma espécie válida.")
                .MustAsync(EspecieExists).WithMessage("A espécie informada não existe.")
                .When(p => p.EspecieId.HasValue);

            RuleFor(p => p.InstalacaoBioterioId)
                .Cascade(CascadeMode.Stop)
                .GreaterThan(0).WithMessage("Selecione uma localização válida.")
                .MustAsync(InstalacaoBioterioExists).WithMessage("A localização informada não existe.")
                .When(p => p.InstalacaoBioterioId.HasValue);

            RuleFor(p => p.LocalOrigemId)
                .Cascade(CascadeMode.Stop)
                .GreaterThan(0).WithMessage("Selecione um local de origem válido.")
                .MustAsync(LocalOrigemExists).WithMessage("O local de origem informado não existe.")
                .When(p => p.LocalOrigemId.HasValue);

            RuleFor(p => p.DataDeEntrada)
                .LessThanOrEqualTo(DateTime.Now).WithMessage("A data de entrada não pode ser futura.")
                .When(p => p.DataDeEntrada.HasValue);
        }

        private async Task<bool> NumeroRegistroUnique(UpdateAnimalCommand command, string numeroRegistro, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(numeroRegistro)) return true;
            
            var isUnique = await _animalRepository.NumeroRegistroIsUnique(numeroRegistro);
            if (isUnique) return true;

            var existingAnimal = await _animalRepository.GetByIdAsync(command.Id);
            return existingAnimal != null && existingAnimal.NumeroRegistro == numeroRegistro;
        }

        private async Task<bool> NumeroChipUnique(UpdateAnimalCommand command, string numeroChip, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(numeroChip)) return true;
            
            var isUnique = await _animalRepository.NumeroChipIsUnique(numeroChip);
            if (isUnique) return true;

            var existingAnimal = await _animalRepository.GetByIdAsync(command.Id);
            return existingAnimal != null && existingAnimal.NumeroChip == numeroChip;
        }

        private async Task<bool> EspecieExists(int? especieId, CancellationToken cancellationToken)
        {
            if (!especieId.HasValue) return true;
            return await _especieRepository.GetByIdAsync(especieId.Value) != null;
        }

        private async Task<bool> InstalacaoBioterioExists(int? instalacaoBioterioId, CancellationToken cancellationToken)
        {
            if (!instalacaoBioterioId.HasValue) return true;
            return await _instalacaoBioterioRepository.GetByIdAsync(instalacaoBioterioId.Value) != null;
        }

        private async Task<bool> LocalOrigemExists(int? localOrigemId, CancellationToken cancellationToken)
        {
            if (!localOrigemId.HasValue) return true;
            return await _localOrigemRepository.GetByIdAsync(localOrigemId.Value) != null;
        }
    }
}
