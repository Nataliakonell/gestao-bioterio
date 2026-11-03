using FluentValidation;

namespace Gestao_Bioterio.Application.Features.RegistrosObito.Command.DeleteRegistroObito
{
    public class DeleteRegistroObitoValidator : AbstractValidator<DeleteRegistroObitoCommand>
    {
        public DeleteRegistroObitoValidator()
        {
            RuleFor(p => p.Id)
                .GreaterThan(0).WithMessage("{PropertyName} deve ser maior que zero.");
        }
    }
}
