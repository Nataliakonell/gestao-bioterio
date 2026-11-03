using FluentValidation;
using Gestao_Bioterio.Application.Common.Validation;
using Gestao_Bioterio.Application.Contracts.Persistence;

namespace Gestao_Bioterio.Application.Features.BiometriaAnimais.Command.CreateBiometriaAnimais
{
    public class CreateBiometriaAnimalValidator : AbstractValidator<CreateBiometriaAnimalCommand>
    {
        private readonly IAnimalRepository _animalRepository;

        public CreateBiometriaAnimalValidator(IBiometriaAnimalRepository biometriaAnimalRepository, IAnimalRepository animalRepository)
        {
            _animalRepository = animalRepository;

            RuleFor(p => p.AnimalId)
                .AnimalDeveEstarVivo(_animalRepository, "biometria");

            RuleFor(p => p.Peso)
                .NotEmpty().WithMessage("Peso é obrigatório.")
                .GreaterThan(0).WithMessage("Peso deve ser maior que 0.");

            RuleFor(p => p.Comprimento);
        }
    }
}
