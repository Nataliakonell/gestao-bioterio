using FluentValidation;

namespace Gestao_Bioterio.Application.Features.RegistrosObito.Command.UpdateRegistroObito
{
    public class UpdateRegistroObitoValidator : AbstractValidator<UpdateRegistroObitoCommand>
    {
        public UpdateRegistroObitoValidator()
        {
            RuleFor(p => p.Id)
                .GreaterThan(0).WithMessage("{PropertyName} deve ser maior que zero.");

            RuleFor(p => p.AnimalId)
                .GreaterThan(0).WithMessage("{PropertyName} deve ser maior que zero.");

            RuleFor(p => p.DataObito)
                .NotEmpty().WithMessage("{PropertyName} é obrigatório.")
                .LessThanOrEqualTo(DateTime.Now.AddDays(1)).WithMessage("{PropertyName} não pode ser uma data futura.");

            RuleFor(p => p.Observacoes)
                .MaximumLength(1000).WithMessage("{PropertyName} não pode exceder 1000 caracteres.");
        }
    }
}
