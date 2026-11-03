using FluentValidation;

namespace Gestao_Bioterio.Application.Features.Perfis.Command.CreatePerfil
{
    public class CreatePerfilValidator : AbstractValidator<CreatePerfilCommand>
    {
        public CreatePerfilValidator()
        {
            RuleFor(p => p.Nome)
                .NotEmpty().WithMessage("{PropertyName} é obrigatório.")
                .NotNull()
                .MaximumLength(50).WithMessage("{PropertyName} não pode exceder 50 caracteres.");

            RuleFor(p => p.Descricao)
                .NotEmpty().WithMessage("{PropertyName} é obrigatória.")
                .NotNull()
                .MaximumLength(200).WithMessage("{PropertyName} não pode exceder 200 caracteres.");
        }
    }
}
