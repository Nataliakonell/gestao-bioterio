using FluentValidation;

namespace Gestao_Bioterio.Application.Features.Perfis.Command.AssignPermissao
{
    public class AssignPermissaoValidator : AbstractValidator<AssignPermissaoCommand>
    {
        public AssignPermissaoValidator()
        {
            RuleFor(p => p.PerfilId)
                .NotEmpty().WithMessage("{PropertyName} é obrigatório.")
                .NotNull();


            RuleFor(p => p.FuncionalidadeId)
                .NotEmpty().WithMessage("{PropertyName} é obrigatório.")
                .NotNull();

            RuleFor(p => p.NivelAcesso)
                .IsInEnum().WithMessage("{PropertyName} deve ser um valor válido.");
        }
    }
}
