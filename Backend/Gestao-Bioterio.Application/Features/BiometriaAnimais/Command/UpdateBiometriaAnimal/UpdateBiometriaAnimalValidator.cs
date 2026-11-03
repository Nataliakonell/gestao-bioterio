using FluentValidation;
using Gestao_Bioterio.Application.Common.Validation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.BiometriaAnimais.Command.UpdateBiometriaAnimal
{
    public class UpdateBiometriaAnimalValidator : AbstractValidator<UpdateBiometriaAnimalCommand>
    {
        private readonly IAnimalRepository _animalRepository;

        public UpdateBiometriaAnimalValidator(IBiometriaAnimalRepository biometriaAnimalRepository, IAnimalRepository animalRepository)
        {
            _animalRepository = animalRepository;

            RuleFor(p => p.Id)
                .GreaterThan(0).WithMessage("O ID da biometria é obrigatório.");

            RuleFor(p => p.AnimalId)
                .AnimalDeveEstarVivo(_animalRepository, "biometria");

            RuleFor(p => p.Peso)
                .NotEmpty().WithMessage("Peso é obrigatório.")
                .GreaterThan(0).WithMessage("Peso deve ser maior que 0.");

            RuleFor(p => p.Comprimento)
                .GreaterThan(0).WithMessage("Comprimento deve ser maior que 0.");
        }
    }
}
