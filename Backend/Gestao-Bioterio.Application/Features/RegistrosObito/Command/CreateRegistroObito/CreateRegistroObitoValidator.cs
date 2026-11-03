using FluentValidation;
using Gestao_Bioterio.Application.Contracts.Persistence;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Features.RegistrosObito.Command.CreateRegistroObito
{
    public class CreateRegistroObitoValidator : AbstractValidator<CreateRegistroObitoCommand>
    {
        public CreateRegistroObitoValidator(IAnimalRepository animalRepository)
        {
            RuleFor(p => p.AnimalId)
                .GreaterThan(0).WithMessage("{PropertyName} deve ser maior que zero.")
                .MustAsync(async (animalId, token) =>
                {
                    var animal = await animalRepository.GetByIdAsync(animalId);
                    return animal != null;
                }).WithMessage("O animal informado não foi encontrado.")
                .MustAsync(async (animalId, token) =>
                {
                    var animal = await animalRepository.GetByIdAsync(animalId);
                    return animal == null || animal.SituacaoAnimal != Situacao.Obito;
                }).WithMessage("O animal informado já está registrado como óbito.");

            RuleFor(p => p.DataObito)
                .NotEmpty().WithMessage("{PropertyName} é obrigatório.")
                .LessThanOrEqualTo(DateTime.Now.AddDays(1)).WithMessage("{PropertyName} não pode ser uma data futura.");

            RuleFor(p => p.Observacoes)
                .MaximumLength(1000).WithMessage("{PropertyName} não pode exceder 1000 caracteres.");
        }
    }
}
