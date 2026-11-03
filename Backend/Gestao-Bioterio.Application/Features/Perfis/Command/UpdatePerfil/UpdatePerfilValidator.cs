using FluentValidation;

namespace Gestao_Bioterio.Application.Features.Perfis.Command.UpdatePerfil
{
    public class UpdatePerfilValidator : AbstractValidator<UpdatePerfilCommand>
    {
        public UpdatePerfilValidator()
        {
            RuleFor(p => p.Id)
                .NotEmpty().WithMessage("{PropertyName} é obrigatório.");

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
