using FluentValidation;

namespace Gestao_Bioterio.Application.Features.Groups.Command.UpdateGroup
{
    public class UpdateGrupoValidator : AbstractValidator<UpdateGrupoCommand>
    {
        public UpdateGrupoValidator()
        {
            RuleFor(p => p.Id)
                .GreaterThan(0).WithMessage("ID do grupo inválido.");

            RuleFor(p => p.Nome)
                .MaximumLength(100).WithMessage("O nome do grupo não deve exceder 100 caracteres.")
                .When(p => !string.IsNullOrEmpty(p.Nome));
        }
    }
}